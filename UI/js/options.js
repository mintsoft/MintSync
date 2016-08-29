/* jshint sub:true */
/** 
	Options.js file.
	Contains javascript for the options pages
*/
/**
	Entry point
*/
function optionsPage(placeholderSelector, preferencesInstance) {
	var self = this;

	this.updateForm = function() {
		/* Load Preferences */
		$("#ServerURL").val(preferencesInstance.get("ServerURL"));
		$('input[name="SaveAuth"][value="'+preferencesInstance.get("SaveAuthentication")+'"]').prop('checked', true);
		$('input[name="SavePass"][value="'+preferencesInstance.get("SavePassword")+'"]').prop('checked', true);
		$('input[name="Cipher"][value="'+preferencesInstance.get("Cipher")+'"]').prop('checked', true);
		$('input[name="KeyLength"][value="'+preferencesInstance.get("KeyLength")+'"]').prop('checked', true);
		$('input[name="AutoFetch"][value="'+preferencesInstance.get("AutoFetch")+'"]').prop('checked', true);
		$('input[name="Notify"][value="'+preferencesInstance.get("Notify")+'"]').prop('checked', true);
		$('input[name="NotifySource"][value="'+preferencesInstance.get("NotifySource")+'"]').prop('checked', true);
		$("#NotifySourceUpdatePeriod").val(preferencesInstance.get("NotifySourceUpdatePeriod"));
		$("#GeneratedPasswordLength").val(preferencesInstance.get("GeneratedPasswordLength"));
		$("#SavePassBDuration").val(preferencesInstance.get("SavePassBDuration") ? preferencesInstance.get("SavePassBDuration") : 0);

		/* generation options */
		$('#passwordStrengthNum').prop('checked', preferencesInstance.get("passwordStrengthNum")=="true");
		$('#passwordStrengthPunc1').prop('checked', preferencesInstance.get("passwordStrengthPunc1")=="true");
		$('#passwordStrengthPunc2').prop('checked', preferencesInstance.get("passwordStrengthPunc2")=="true");
	}

	$(document).ready(function(){
		$(document).autoBars(function() {
			var optionsFormMarkup = $.handlebarTemplates["optionsForm"]({});
			$(placeholderSelector).replaceWith(optionsFormMarkup);

			addPreferencesEventHandlers();

			self.updateForm();

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
				preferencesInstance.set("SavedPassword") = undefined;
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
		
		preferencesInstance.set("ServerURL", serverUrl);
		preferencesInstance.set("SavePassword", $("input[type=radio][name=SavePass]:checked").val());
		preferencesInstance.set("SaveAuthentication", $("input[type=radio][name=SaveAuth]:checked").val());
		preferencesInstance.set("Cipher", $("input[type=radio][name=Cipher]:checked").val());
		preferencesInstance.set("KeyLength", $("input[type=radio][name=KeyLength]:checked").val());
		preferencesInstance.set("AutoFetch", $("input[type=radio][name=AutoFetch]:checked").val());
		preferencesInstance.set("Notify", $("input[type=radio][name=Notify]:checked").val());
		preferencesInstance.set("NotifySource", $("input[type=radio][name=NotifySource]:checked").val());
		preferencesInstance.set("NotifySourceUpdatePeriod", $("#NotifySourceUpdatePeriod").val() <= 0 ? 1 : $("#NotifySourceUpdatePeriod").val());
		preferencesInstance.set("GeneratedPasswordLength", $("#GeneratedPasswordLength").val());
		
		preferencesInstance.set("SavePassBDuration", $("#SavePassBDuration").val() ? $("#SavePassBDuration").val() : 0);
		
		/* generation options */
		preferencesInstance.set("passwordStrengthNum", $("#passwordStrengthNum").is(":checked"));
		preferencesInstance.set("passwordStrengthPunc1", $("#passwordStrengthPunc1").is(":checked"));
		preferencesInstance.set("passwordStrengthPunc2", $("#passwordStrengthPunc2").is(":checked"));
		
		
		//clear saved data if applicable
		if(preferences["SaveAuthentication"]!=1)
		{
			preferencesInstance.set("SavedAuthentication", undefined);
		}
		if(preferences["SaveAuthentication"]!=0.8)
		{
			console.info("Resetting saved authentication credentials");
			stubFunctions.genericRetrieve_mintSyncGlobals().authentication = undefined;
		}
		
		if(preferences["SavePassword"]!=1)
		{
			preferencesInstance.set("SavedPassword", undefined);
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
		if(		preferencesInstance.get("Notify") == "0" || 
				preferencesInstance.get("Notify") == "1" && preferencesInstance("NotifySource") != "cache" )
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