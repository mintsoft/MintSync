/** Background Process File**/

/** Persistant variables for browserSession */
var mintSyncGlobals = {
	'passwd': undefined,
	'authentication': undefined,
	'cacheTimer': undefined,
	'urlCache': [],
	'theButton': undefined
};

/**
	Callback executed by the AJAX request, 	
*/
function mint_handleNotificationIcon(data)
{
	var parsedResult = data;	//already an object
	if(typeof data=="string")	//this should never happen, probably means there was an error
	{
		console.log(data)
		//parsedResult = $.parseJSON(data);
	}
	switch(parsedResult.status)
	{
		case "ok":
			if(parsedResult.data>0)
			{
				mintSyncGlobals.theButton.badge.textContent="   ";
				mintSyncGlobals.theButton.badge.backgroundColor='#00D100';
				mintSyncGlobals.theButton.badge.color = '#FFFFFF';
				mintSyncGlobals.theButton.title = "Credentials are available";
			}
			else
			{
				mintSyncGlobals.theButton.badge.textContent="";
				mintSyncGlobals.theButton.badge.backgroundColor='#cccccc';
			}
		break;
		case "fail":
			mintSyncGlobals.theButton.badge.textContent="!";
			mintSyncGlobals.theButton.badge.backgroundColor='#FFFF00';
			mintSyncGlobals.theButton.badge.color = '#FFFFFF';
			mintSyncGlobals.theButton.title = "There was an error, checking this URL";
			console.log("Failed: "+parsedResult.data.reason);
		break;
		default:
			mintSyncGlobals.theButton.badge.textContent="X!";
			mintSyncGlobals.theButton.badge.color = '#FFFFFF';
			mintSyncGlobals.theButton.badge.backgroundColor='#DD0000';
			mintSyncGlobals.theButton.title = "There was a serious error, check the Error Console";
			console.log("An unknown state has been reached: "+data);
	}
}

/**
	Function to perform the notification on the button if enabled
*/
function mint_handleNotify(URL)
{
	if($MS.getNotify())
	{
		if($MS.getAuthenticationObject(false)===null)
		{
				mintSyncGlobals.theButton.badge.textContent=" ? ";
				mintSyncGlobals.theButton.badge.color = '#CCCCCC';
				mintSyncGlobals.theButton.badge.backgroundColor='#FFFCCA';
				mintSyncGlobals.theButton.title = "You have not logged in";
			return;
		}
		switch(widget.preferences["NotifySource"])
		{
			case "cache":
				
			//	console.log("Processing Notification Request from: cache");
				
				mint_handleNotificationIcon({
					'status':'ok',
					'data': ($.inArray(URL.toLowerCase(),mintSyncGlobals.urlCache)===-1)?0:1
				});
				
			break;

			case "ajax":
			default:

				//console.log("Processing Notification Request from: AJAX");
				
				$MS.checkIfPasswordsExist(URL,{
					error: function(textStatus,errorThrown) {
						console.log("An AJAX Error Occurred:" + textStatus + "\n" + errorThrown);
					},
					success: function(data){
						mint_handleNotificationIcon(data);
					}
				});
		}
	}
	else
	{	//reset to no notification visible
		mintSyncGlobals.theButton.badge.textContent="";
		mintSyncGlobals.theButton.badge.backgroundColor='#cccccc';
		mintSyncGlobals.theButton.badge.color = '#FFFFFF';
	}
}

/**
	Function called by the timer and will update the local URL cache used by the notification icon
*/
function updateLocalURLCache()
{
	clearTimeout(mintSyncGlobals.cacheTimer);
	console.log("Updating local URL cache");
	
	//fetch the list of URLS and keep them in a cache
	$MS.listURLS({
		success: function(rawdata){
			
			mintSyncGlobals.urlCache = [];
			
			for(var x in rawdata.data)
			{
				mintSyncGlobals.urlCache.push(rawdata.data[x].URL.toLowerCase());
			}
		},
		error: function(jq,textStatus,errorThrown){
			console.log("You have reached an undefined state ("+jq.status+" "+textStatus+"): " + errorThrown);
			mintSyncGlobals.theButton.badge.textContent="X!";
			mintSyncGlobals.theButton.badge.backgroundColor='#DD0000';
			mintSyncGlobals.theButton.badge.color = '#FFFFFF';
			mintSyncGlobals.theButton.title = "There was an error updating the local cache";
		},
	});
	
	mintSyncGlobals.cacheTimer = setTimeout(updateLocalURLCache,60000*widget.preferences["NotifySourceUpdatePeriod"]);
}


/** Entry Point **/
window.addEventListener("load", function(){
	var newWindow,
		ToolbarUIItemProperties = {
			title: "MintSync",
			icon: "img/button_icon.png",
			badge: {},
			popup: {
				href: "popup.html",
				width: 330,
				height: 260
			}
		};
		
	mintSyncGlobals.theButton = opera.contexts.toolbar.createItem(ToolbarUIItemProperties);
	opera.contexts.toolbar.addItem(mintSyncGlobals.theButton);

	//add connection to popup for currentURL sending
	opera.extension.onconnect = function(event) {
		try {
			event.source.postMessage({
									'action':'click',
									'src':'backgroundProcess',
									'url':opera.extension.tabs.getFocused().url
								});
		}
		catch(error) {
			//ignore it for now
			alert("There was an error with the Opera Extension OnConnect callback:"+error);
		}
	}

	//add handler for tab notifications
	opera.extension.tabs.onfocus = function() {
		try {
			//console.log("onfocus: "+opera.extension.tabs.getFocused().url);
			mint_handleNotify(opera.extension.tabs.getFocused().url);
		}
		catch(error) {
			//ignore it for now
			alert("There was an error with the Opera Extension onfocus callback:"+error);
		}
	}
	
	//add handler for messages, including injected JS
	opera.extension.onmessage = function(event) {
		switch(event.data.src)
		{
			//message from the Inject JS
			case "injectedJS":
				if(event.data.action=='navigate')	// got the URL from the injected script
					mint_handleNotify(event.data.url);
			break;
			
			//messages from the popup script
			case "popup":

			break;
			
			case "options":
				if(event.data.action=='stopLocalCache')
				{
					clearTimeout(mintSyncGlobals.cacheTimer);
					mintSyncGlobals.urlCache = [];
				}
				else if(event.data.action='startLocalCache')
				{
					updateLocalURLCache();		
				}
			break;
		}
	}
	
	//Optional NotifySource system,
	// if the notifysource is configured to local cache, then maintain a local cache every x mins
	if($MS.getNotify() && widget.preferences["NotifySource"]==="cache")
	{
		//updates the cache and retriggers the timeout
		updateLocalURLCache();		
	}
	
}, false);