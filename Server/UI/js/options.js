/** 
	Options.js file.
	Contains javascript for the options pages
*/
/**
	Entry point
*/
$(document).ready(function(){
	/* Load Preferences */
	$("#ServerURL").val(widget.preferences["ServerURL"]);
	$('input[name="SaveAuth"][value="'+widget.preferences["SaveAuthentication"]+'"]').prop('checked', true);
	$('input[name="SavePass"][value="'+widget.preferences["SavePassword"]+'"]').prop('checked', true);
	$('input[name="Cipher"][value="'+widget.preferences["Cipher"]+'"]').prop('checked', true);
	$('input[name="KeyLength"][value="'+widget.preferences["KeyLength"]+'"]').prop('checked', true);
	$('input[name="AutoFetch"][value="'+widget.preferences["AutoFetch"]+'"]').prop('checked', true);
	$('input[name="Notify"][value="'+widget.preferences["Notify"]+'"]').prop('checked', true);
	$('input[name="NotifySource"][value="'+widget.preferences["NotifySource"]+'"]').prop('checked', true);
	$("#NotifySourceUpdatePeriod").val(widget.preferences["NotifySourceUpdatePeriod"]);
	$("#GeneratedPasswordLength").val(widget.preferences["GeneratedPasswordLength"]);
	$("#SavePassBDuration").val(widget.preferences["SavePassBDuration"] ? widget.preferences["SavePassBDuration"] : 0);

	/* generation options */
	$('#passwordStrengthNum').prop('checked',	widget.preferences["passwordStrengthNum"]=="true");
	$('#passwordStrengthPunc1').prop('checked',	widget.preferences["passwordStrengthPunc1"]=="true");
	$('#passwordStrengthPunc2').prop('checked',	widget.preferences["passwordStrengthPunc2"]=="true");
	
	/* Bind the local cache update */
	$("#localCacheUpdateButton").click(function(){
		cacheUpdateHandling();
	});
	/* console display the local cache */
	$("#dumpLocalCacheButton").click(function(){
		var localCache = genericRetrieve_mintSyncGlobals().urlCache;
		console.debug(localCache);
		for(var URL in localCache)
		{
			console.debug(localCache[URL]);
		}
	});
	
	/* Bind force forget saved password*/
	$("#forgetSavedCryptoPass").click(function(){
		console.log("Forgetting Saved Crypto Password");
		//For BG Process/Browser session
		genericRetrieve_mintSyncGlobals().passwd = undefined;
		//For "yes"
		widget.preferences["SavedPassword"] = undefined;
	});
});

/** Set Save Preferences */
function savePrefs() {
	//check if the last character is a /, if not append one!
	var serverUrl = $("#ServerURL").val();
	if(serverUrl.charAt(serverUrl.length-1)!="/")
		serverUrl+="/";
		
	widget.preferences["ServerURL"] 				= serverUrl;
	widget.preferences["SavePassword"]				= $("input[type=radio][name=SavePass]:checked").val();
	widget.preferences["SaveAuthentication"]		= $("input[type=radio][name=SaveAuth]:checked").val();
	widget.preferences["Cipher"] 					= $("input[type=radio][name=Cipher]:checked").val();
	widget.preferences["KeyLength"] 				= $("input[type=radio][name=KeyLength]:checked").val();
	widget.preferences["AutoFetch"]					= $("input[type=radio][name=AutoFetch]:checked").val();
	widget.preferences["Notify"]					= $("input[type=radio][name=Notify]:checked").val();
	widget.preferences["NotifySource"]				= $("input[type=radio][name=NotifySource]:checked").val();
	widget.preferences["NotifySourceUpdatePeriod"] 	= $("#NotifySourceUpdatePeriod").val();
	widget.preferences["GeneratedPasswordLength"] 	= $("#GeneratedPasswordLength").val();
	
	widget.preferences["SavePassBDuration"] 		= $("#SavePassBDuration").val() ? $("#SavePassBDuration").val() : 0;
	
	/* generation options */
	widget.preferences["passwordStrengthNum"]		= $("#passwordStrengthNum").is(":checked");
	widget.preferences["passwordStrengthPunc1"]		= $("#passwordStrengthPunc1").is(":checked");
	widget.preferences["passwordStrengthPunc2"]		= $("#passwordStrengthPunc2").is(":checked");
	
	
	//clear saved data if applicable
	if(widget.preferences["SaveAuthentication"]!=1)
	{
		widget.preferences["SavedAuthentication"] = undefined;
	}
	if(widget.preferences["SaveAuthentication"]!=0.8)
	{
		console.info("Resetting saved authentication credentials");
		genericRetrieve_mintSyncGlobals().authentication = undefined;
	}
	
	if(widget.preferences["SavePassword"]!=1)
	{
		widget.preferences["SavedPassword"]	= undefined;
	}
	if(widget.preferences["SavePassword"]!=0.8)
	{
		console.info("Resetting saved encryption key");
		genericRetrieve_mintSyncGlobals().passwd = undefined;
	}

	cacheUpdateHandling();
}

/**
	Will handle the local cache handling
*/
function cacheUpdateHandling(){
	/**
		This is so the effects of a change to the notification caching are immediate
	*/
	if(		widget.preferences["Notify"]=="0" || 
			widget.preferences["Notify"]=="1"  && widget.preferences["NotifySource"]!="cache"		)
	{
		//should not be keeping a local cache, send a message to the bg process and stop it
		//this uses a message because it does not work if clearTimeout is used from here
		
		//stopLocalCache
		genericPostMessage({
			'action': 'stopLocalCache',
			'src' : 'options',
		});
	}
	else
	{
		//the cache should be kept, so start the timeout
		
		genericPostMessage({
			'action': 'startLocalCache',
			'src' : 'options',
		});
		//startLocalCache
	}
	
}

/**
	Toggle the view of the "more options" and cycle the text
*/
function toggleAdvancedOptions(fromHere){
	$(".advancedOption").not(".hidden").slideToggle('fast');
	var str = $(fromHere).text();
	if(str.search("More")==-1)
		$(fromHere).text(str.replace("Fewer","More"));
	else
		$(fromHere).text(str.replace("More","Fewer"));
	
}