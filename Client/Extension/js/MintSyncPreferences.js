
function MintSyncPreferences(){
	var preferences = stubFunctions.genericRetrieve_preferencesObj(),
		timeout,
		timeoutActive = false,
		self = this;

	this.get = function(preferenceName) {
		var rawPreferences = stubFunctions.genericRetrieve_preferencesObj();
		console.debug(rawPreferences);
		if(preferenceName === 'ServerURL' && rawPreferences.hasOwnProperty("ServerURL") && rawPreferences.ServerURL !== "")
			return rawPreferences.ServerURL;
		console.debug("Returning: "+preferences[preferenceName]);
		return preferences[preferenceName];
	};
	this.set = function(name, value) {
		console.debug("Object preferences", preferences)
		preferences[name] = value;
		
		if(name === 'ServerURL')
			return;
		
		if(timeoutActive)
		{
			timeoutActive = false;
			clearTimeout(timeout);
		}
		timeout = setTimeout(function(){
			var preferencesToSave =  $.extend({}, preferences);
			delete preferencesToSave.ServerURL;
			console.debug("Save timeout fired", preferencesToSave);
			$MS.UpdateServerSavedPreferences(preferencesToSave, {});
			timeoutActive = false;
		}, 200);
		timeoutActive = true;
	};

	this.fetch = function(completeCallback) {
		console.debug("Fetching Preferences");
		$MS.retrieveServerSavedPreferences({success: function(response) {
			var serverPreferences = response.data.preferences;
			console.debug("Object preferences", preferences)
			console.debug("Server preferences", serverPreferences);
			$.extend(preferences, serverPreferences);
			console.debug("Result", preferences)
			if(completeCallback !== undefined)
				completeCallback(preferences);
		}})
	}
}
var $MP = new MintSyncPreferences();
