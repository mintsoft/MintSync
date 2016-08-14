/* jshint sub:true */
/** 
	Options.js file.
	Contains javascript for the options pages
*/
/**
	Entry point
*/
function optionsPage(placeholderSelector) {

	$(document).ready(function(){
		$(document).autoBars(function() {
			var optionsFormMarkup = $.handlebarTemplates["optionsForm"]({});
			$(placeholderSelector).replaceWith(optionsFormMarkup);

			addPreferencesEventHandlers();

			var preferences = stubFunctions.genericRetrieve_preferencesObj();
			/* Load Preferences */
			$("#ServerURL").val(preferences["ServerURL"]);
			$('input[name="SaveAuth"][value="'+preferences["SaveAuthentication"]+'"]').prop('checked', true);
			$('input[name="SavePass"][value="'+preferences["SavePassword"]+'"]').prop('checked', true);
			$('input[name="Cipher"][value="'+preferences["Cipher"]+'"]').prop('checked', true);
			$('input[name="KeyLength"][value="'+preferences["KeyLength"]+'"]').prop('checked', true);
			$('input[name="AutoFetch"][value="'+preferences["AutoFetch"]+'"]').prop('checked', true);
			$('input[name="Notify"][value="'+preferences["Notify"]+'"]').prop('checked', true);
			$('input[name="NotifySource"][value="'+preferences["NotifySource"]+'"]').prop('checked', true);
			$("#NotifySourceUpdatePeriod").val(preferences["NotifySourceUpdatePeriod"]);
			$("#GeneratedPasswordLength").val(preferences["GeneratedPasswordLength"]);
			$("#SavePassBDuration").val(preferences["SavePassBDuration"] ? preferences["SavePassBDuration"] : 0);

			/* generation options */
			$('#passwordStrengthNum').prop('checked', preferences["passwordStrengthNum"]=="true");
			$('#passwordStrengthPunc1').prop('checked', preferences["passwordStrengthPunc1"]=="true");
			$('#passwordStrengthPunc2').prop('checked', preferences["passwordStrengthPunc2"]=="true");

			/* Bind the local cache update */
			$("#localCacheUpdateButton").click(function(){
				cacheUpdateHandling();
			});
			/* console display the local cache */
			$("#dumpLocalCacheButton").click(function(){
				var localCache = stubFunctions.genericRetrieve_mintSyncGlobals().urlCache;
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
				stubFunctions.genericRetrieve_mintSyncGlobals().passwd = undefined;
				//For "yes"
				preferences["SavedPassword"] = undefined;
			});
		});
	});

	/** Set Save Preferences */
	function savePrefs() {

		var preferences = stubFunctions.genericRetrieve_preferencesObj();
		//check if the last character is a /, if not append one!
		var serverUrl = $("#ServerURL").val();
		if(serverUrl.charAt(serverUrl.length-1)!="/")
			serverUrl+="/";
			
		preferences["ServerURL"] = serverUrl;
		preferences["SavePassword"] = $("input[type=radio][name=SavePass]:checked").val();
		preferences["SaveAuthentication"] = $("input[type=radio][name=SaveAuth]:checked").val();
		preferences["Cipher"] = $("input[type=radio][name=Cipher]:checked").val();
		preferences["KeyLength"] = $("input[type=radio][name=KeyLength]:checked").val();
		preferences["AutoFetch"] = $("input[type=radio][name=AutoFetch]:checked").val();
		preferences["Notify"] = $("input[type=radio][name=Notify]:checked").val();
		preferences["NotifySource"] = $("input[type=radio][name=NotifySource]:checked").val();
		preferences["NotifySourceUpdatePeriod"] = $("#NotifySourceUpdatePeriod").val() <= 0 ? 1 : $("#NotifySourceUpdatePeriod").val();
		preferences["GeneratedPasswordLength"] = $("#GeneratedPasswordLength").val();
		
		preferences["SavePassBDuration"] = $("#SavePassBDuration").val() ? $("#SavePassBDuration").val() : 0;
		
		/* generation options */
		preferences["passwordStrengthNum"] = $("#passwordStrengthNum").is(":checked");
		preferences["passwordStrengthPunc1"] = $("#passwordStrengthPunc1").is(":checked");
		preferences["passwordStrengthPunc2"] = $("#passwordStrengthPunc2").is(":checked");
		
		
		//clear saved data if applicable
		if(preferences["SaveAuthentication"]!=1)
		{
			preferences["SavedAuthentication"] = undefined;
		}
		if(preferences["SaveAuthentication"]!=0.8)
		{
			console.info("Resetting saved authentication credentials");
			stubFunctions.genericRetrieve_mintSyncGlobals().authentication = undefined;
		}
		
		if(preferences["SavePassword"]!=1)
		{
			preferences["SavedPassword"]	= undefined;
		}
		if(preferences["SavePassword"]!=0.8)
		{
			console.info("Resetting saved encryption key");
			stubFunctions.genericRetrieve_mintSyncGlobals().passwd = undefined;
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
		var preferences = stubFunctions.genericRetrieve_preferencesObj();
		if(		preferences["Notify"]=="0" || 
				preferences["Notify"]=="1"  && preferences["NotifySource"]!="cache"		)
		{
			//should not be keeping a local cache, send a message to the bg process and stop it
			//this uses a message because it does not work if clearTimeout is used from here
			
			//stopLocalCache
			stubFunctions.genericPostMessage({
				'action': 'stopLocalCache',
				'src' : 'options',
			});
		}
		else
		{
			//the cache should be kept, so start the timeout
			
			stubFunctions.genericPostMessage({
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

	/**
		Add Preferences Event Callbacks
	*/
	function addPreferencesEventHandlers()
	{
		$("#moreOptionsA").click(function(event){
			event.preventDefault();
			toggleAdvancedOptions(this);
		});
		
		$("#saveButtonInput").click(function(event){
			event.preventDefault();
			savePrefs();
		});
	}
}