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
		console.error("You have reached an undefined state: bg.js:20");
		console.error(data);
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
				mintSyncGlobals.theButton.title = "";
			}
		break;
		case "fail":
			mintSyncGlobals.theButton.badge.textContent="!";
			mintSyncGlobals.theButton.badge.backgroundColor='#FFFF00';
			mintSyncGlobals.theButton.badge.color = '#FFFFFF';
			mintSyncGlobals.theButton.title = "There was an error, checking this URL";
			console.error("Failed: "+parsedResult.data.reason);
		break;
		default:
			mintSyncGlobals.theButton.badge.textContent="X!";
			mintSyncGlobals.theButton.badge.color = '#FFFFFF';
			mintSyncGlobals.theButton.badge.backgroundColor='#DD0000';
			mintSyncGlobals.theButton.title = "There was a serious error, check the Error Console";
			console.error("An unknown state has been reached: "+data);
	}
}

/**
	Function to perform the notification on the button if enabled
*/
function mint_handleNotify(URL)
{
	if($MS.getNotify())
	{
		if(!$MS.checkForSavedAuth())
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
				
				//console.info("Processing Notification Request from: cache");
				//var URLExists = ($.inArray(URL.toLowerCase(),mintSyncGlobals.urlCache)===-1)?0:1;
				var URLExists = 0,
					srcURL = URL.toLowerCase(),
					regexEquivalent = "";
				
				//console.info("Source URL: "+srcURL);
				
				for(urlIndex in mintSyncGlobals.urlCache) 
				{ 
					regexEquivalent = mintSyncGlobals.urlCache[urlIndex];
					//escape regex characters
					//? * [ ] { } ( ) . ^ $ - | / \
					regexEquivalent = regexEquivalent.replace(/\\/g,'\\\\');
					regexEquivalent = regexEquivalent.replace(/\?/g,'\\?');
					regexEquivalent = regexEquivalent.replace(/\*/g,'\\*');
					regexEquivalent = regexEquivalent.replace(/\[/g,'\\[');
					regexEquivalent = regexEquivalent.replace(/\]/g,'\\]');
					regexEquivalent = regexEquivalent.replace(/\{/g,'\\{');
					regexEquivalent = regexEquivalent.replace(/\}/g,'\\}');
					regexEquivalent = regexEquivalent.replace(/\(/g,'\\(');
					regexEquivalent = regexEquivalent.replace(/\)/g,'\\)');
					regexEquivalent = regexEquivalent.replace(/\./g,'\\.');
					regexEquivalent = regexEquivalent.replace(/\^/g,'\\^');
					regexEquivalent = regexEquivalent.replace(/\$/g,'\\$');
					regexEquivalent = regexEquivalent.replace(/\-/g,'\\-');
					regexEquivalent = regexEquivalent.replace(/\|/g,'\\|');
					regexEquivalent = regexEquivalent.replace(/\//g,'\\/');
					
					//convert % into regex equivalent
					regexEquivalent = regexEquivalent.replace(/%%/g,'#mintSync_replstr#');
					regexEquivalent = regexEquivalent.replace(/%/g,'.*');
					//convert _ into regex equivalent
					//regexEquivalent = regexEquivalent.replace(/_/g,'.');
					regexEquivalent = "^"+regexEquivalent.replace(/#mintSync_replstr#/g,'%%')+"$";
				
					//console.info(regexEquivalent);
					//URLExists = (mintSyncGlobals.urlCache[url]==srcURL)?1:0;
					URLExists = srcURL.match(regexEquivalent);
					
					if(URLExists)
					{
						URLExists=1;
						break;
					}
					else
						URLExists=0;
				}
				
				mint_handleNotificationIcon({
					'status':'ok',
					'data': URLExists
				});
				
			break;

			case "ajax":
			default:

				//console.info("Processing Notification Request from: AJAX");
				
				$MS.checkIfPasswordsExist(URL,{
					error: function(jq, textStatus,errorThrown) {
						console.error("An AJAX Error Occurred:"+ textStatus + "\n" + errorThrown);
						console.error(jq);
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
		mintSyncGlobals.theButton.title = "";
	}
}

/**
	Function called by the timer and will update the local URL cache used by the notification icon
*/
function updateLocalURLCache()
{
	clearTimeout(mintSyncGlobals.cacheTimer);
	console.info("Updating local URL cache");
	
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
			console.error("You have reached an undefined state ("+jq.status+" "+textStatus+"): " + errorThrown);
			console.error(jq);
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

	//OnConnect for both injectJS and popups
	opera.extension.onconnect = function(event) {
		console.debug("Handling onconnect message",event);
		try {
			//if it's our Popup
			if ( event.origin.indexOf("popup.html") > -1 && event.origin.indexOf("widget://") > -1)
			{
			
				var tab = opera.extension.tabs.getFocused();
				if(tab)
				{
					//send a message to the injectedJS with the messageChannel to the popup
					tab.postMessage('popupConnect', [event.source]);
				}
			}
			else
			{
				
			}
		}
		catch(error) {
			//ignore it for now
			console.error("There was an error with the Opera Extension OnConnect callback:",error);
		}
	}

	//add handler for tab notifications
	opera.extension.tabs.onfocus = function() {
		try {
			if(opera.extension.tabs.getFocused())	//on some operations this object is not quite set yet
				mint_handleNotify(opera.extension.tabs.getFocused().url);
		}
		catch(error) {
			//ignore it for now
			console.error("There was an error with the Opera Extension onfocus callback:",error);
		}
	}
	
	//add handler for messages, including injected JS
	opera.extension.onmessage = function(event) {
		console.debug("Received extension message:", event);
		switch(event.data.src)
		{
			//message from the Inject JS
			case "injectedJS":
				if(event.data.action=='navigate')	// got the URL from the injected script
					mint_handleNotify(event.data.url);
				else if(event.data.action=='inputList')
				{
					console.log("background Process Received:",event.data.inputs);
				}
				
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
			case "popup":
				if(event.data.action=="requestInputList")
				{
					//post message to the injectedJS
				}
			break;
			default:
			//messages from any other source
				if(event.data.action=='updateLocalCache')
				{
					updateLocalURLCache();
				}
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