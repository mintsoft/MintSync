/** Background Process File**/

/** Persistant variables for browserSession */
var mintSyncGlobals = {
	'passwd': undefined,
	'authentication': undefined,
	'cacheTimer': undefined,
	'urlCache': []
};

/**
	Callback executed by the AJAX request, 	
*/
function mint_handleNotificationIcon(data,theButton)
{
	var parsedResult = data;	//already an object
	if(typeof data=="string")	//JSON that needs parsing
		parsedResult = $.parseJSON(data);
	
	switch(parsedResult.status)
	{
		case "ok":
			if(parsedResult.data>0)
			{
				theButton.badge.textContent=" * ";
				theButton.badge.backgroundColor='#00D100';
			}
			else
			{
				theButton.badge.textContent="";
				theButton.badge.backgroundColor='#cccccc';
			}
		break;
		case "fail":
			theButton.badge.textContent="!";
			theButton.badge.backgroundColor='#FFFF00';
			console.log("Failed: "+parsedResult.data.reason);
		break;
		default:
			theButton.badge.textContent="X!";
			theButton.badge.backgroundColor='#DD0000';
			console.log("An unknown state has been reached: "+data);
	}
}

/**
	Function to perform the notification on the button if enabled
*/
function mint_handleNotify(URL,theButton)
{
	if($MS.getNotify())
	{
		switch(widget.preferences["NotifySource"])
		{
			case "cache":
				
			//	console.log("Processing Notification Request from: cache");
				
				mint_handleNotificationIcon({
					'status':'ok',
					'data': ($.inArray(URL.toLowerCase(),mintSyncGlobals.urlCache)===-1)?0:1
				},theButton);
				
			break;

			case "ajax":
			default:

				//console.log("Processing Notification Request from: AJAX");
				
				$MS.checkIfPasswordsExist(URL,{
					error: function(textStatus,errorThrown) {
						console.log("An AJAX Error Occurred:" + textStatus + "\n" + errorThrown);
					},
					success: function(data){
						mint_handleNotificationIcon(data,theButton);
					}
				});
		}
	}
	else
	{	//reset to no notification visible
		theButton.badge.textContent="";
		theButton.badge.backgroundColor='#cccccc';
	}
}

/**
	Function called by the timer and will update the local URL cache used by the notification icon
*/
function updateLocalURLCache()
{
	clearTimeout(mintSyncGlobals.cacheTimer);
	//console.log("updating local cache");
	
	//fetch the list of URLS and keep them in a cache
	$MS.listURLS({
		success: function(data){
			var parsedObj = $.parseJSON(data);
			
			mintSyncGlobals.urlCache = [];
			
			for(var x in parsedObj.data)
			{
				mintSyncGlobals.urlCache.push(parsedObj.data[x].URL.toLowerCase());
			}
		},
		error: function(){
			
		},
	});
	
	mintSyncGlobals.cacheTimer = setTimeout(updateLocalURLCache,60000*widget.preferences["NotifySourceUpdatePeriod"]);
}


/** Entry Point **/
window.addEventListener("load", function(){
	var theButton,
		newWindow,
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
		
	theButton = opera.contexts.toolbar.createItem(ToolbarUIItemProperties);
	opera.contexts.toolbar.addItem(theButton);

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
			mint_handleNotify(opera.extension.tabs.getFocused().url,theButton);
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
					mint_handleNotify(event.data.url,theButton);
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