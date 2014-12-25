/* jshint sub:true */
/** Background Process File **/

/** Persistant variables for browserSession */
var mintSyncGlobals = {
	'passwd': undefined,			//saved crypto password
	'authentication': undefined,	//save auth details
	'cacheTimer': undefined,		//URL Cache timer
	'urlCache': [],				//array of URLS
	'passwdResetTimer': undefined,	//URL Cache timer
	'theButton': undefined			//the button on the toolbar
};

/**
 Helper function for badge management
*/
function setBadgeStatus(textContent, bgColour, mouseoverText, textcolour)
{
	//O12 Implementation:
	mintSyncGlobals.theButton.badge.textContent = textContent;
	mintSyncGlobals.theButton.badge.backgroundColor = bgColour;
	mintSyncGlobals.theButton.title = mouseoverText;
	
	if(textcolour !== undefined)
		mintSyncGlobals.theButton.badge.color = textcolour;	
}

/**
 Helper function for badge reset
*/
function resetBadgeStatus()
{
	setBadgeStatus("", "#CCCCCC", "", "#FFFFFF");
}

/**
	Callback executed by the AJAX request,
*/
function mint_handleNotificationIcon(data)
{
	var parsedResult = data;		//already an object
	if(typeof data === "string")	//this should never happen, probably means there was an error
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
				setBadgeStatus("   ", '#00D100', "Credentials are available", '#FFFFFF' );
			}
			else
			{
				resetBadgeStatus();
			}
		break;
		case "fail":
			setBadgeStatus("!", '#FFFF00', "There was an error, checking this URL", "#FFFFFF");
			console.error("Failed: "+parsedResult.data.reason);
		break;
		default:
			setBadgeStatus("X!", '#FFFFFF', "There was a serious error, check the Error Console", "#DD0000");
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
		var preferences = stubFunctions.genericRetrieve_preferencesObj();
		if(!$MS.checkForSavedAuth())
		{
			setBadgeStatus(" ? ", "#FFFCCA", "You have not logged in", "#CCCCCC" );
			return;
		}
		
		switch(preferences["NotifySource"])
		{
			case "cache":
				
				var URLExists = 0,
					srcURL = URL.toLowerCase(),
					regexEquivalent = "";
				
				//console.info("Source URL: "+srcURL);
				
				for(var urlIndex in mintSyncGlobals.urlCache)
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
					{
						URLExists=0;
					}
				}
				
				mint_handleNotificationIcon({
					'status':'ok',
					'data': URLExists
				});
				
			break;

//			case "ajax":
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
		resetBadgeStatus();
	}
}

/**
	Function called by the timer and will update the local URL cache used by the notification icon
*/
function updateLocalURLCache()
{
	var preferences = stubFunctions.genericRetrieve_preferencesObj();
	
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
			setBadgeStatus("X!", '#FFFFFF', "There was an error updating the local cache!", "#DD0000");
		},
	});
	
	mintSyncGlobals.cacheTimer = setTimeout(updateLocalURLCache,60000*preferences["NotifySourceUpdatePeriod"]);
}

/**
	Reset the password stored in the background process
*/
function clearCachedPasswd()
{
	console.debug("clearCachedPasswd being called, BG saved passwd cleared");
	//passwdResetTimer
	mintSyncGlobals.passwd = undefined;
	clearTimeout(mintSyncGlobals.passwdResetTimer);
}

/**
	(re)start the timer to reset the stored password
*/
function startPasswdResetTimer()
{
	var preferences = stubFunctions.genericRetrieve_preferencesObj();
	console.debug("StartPasswordResettimer");
	clearTimeout(mintSyncGlobals.passwdResetTimer);
	if(preferences["SavePassBDuration"]*1 > 0)
	{
		mintSyncGlobals.passwdResetTimer = setTimeout(clearCachedPasswd,60000*preferences["SavePassBDuration"]);
	}
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

	var preferences = stubFunctions.genericRetrieve_preferencesObj();

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
				console.debug("onconnect received from something not popup.html, event");
			}
		}
		catch(error) {
			//ignore it for now
			console.error("There was an error with the Opera Extension OnConnect callback:",error);
		}
	};

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
	};
	
	//add handler for messages, including injected JS
	opera.extension.onmessage = function(event) {
		console.debug("Received extension message:", event);
		switch(event.data.src)
		{
			//message from the Inject JS
			case "injectedJS":
				if(event.data.action == 'updateIconBadge')	// got the URL from the injected script
				{	//if one uses the URL from the injected script here, and the tab isn't the
					//currently highlighted one, then it'll display the notification for the
					//background navigation; therefore we must check again for the currently
					//focused tab
					stubFunctions.genericRetrieve_currentTab(function(currentTab){
						mint_handleNotify(currentTab?currentTab.url:"");
					});
				}
				else if(event.data.action == 'inputList')
				{
					console.log("background Process Received:",event.data.inputs);
				}
				
			break;
			case "options":
				if(event.data.action == 'stopLocalCache')
				{
					clearTimeout(mintSyncGlobals.cacheTimer);
					mintSyncGlobals.urlCache = [];
				}
				else if(event.data.action == 'startLocalCache')
				{
					updateLocalURLCache();
				}
			break;
			case "popup":
				if(event.data.action == "requestInputList")
				{
					//post message to the injectedJS --no longer used
				}
			break;
			case "all":
				if (event.data.action == 'startPasswdResetTimer')
				{
					startPasswdResetTimer();
				}
			break;
			default:
			//messages from any other source
				if(event.data.action == 'updateLocalCache')
				{
					updateLocalURLCache();
				}
		}
	};
	
	//Optional NotifySource system,
	// if the notifysource is configured to local cache, then maintain a local cache every x mins
	if($MS.getNotify() && preferences["NotifySource"] === "cache")
	{
		//updates the cache and retriggers the timeout
		updateLocalURLCache();
	}
	
}, false);