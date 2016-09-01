
function MintSyncPreferences(){
	var preferences = stubFunctions.genericRetrieve_preferencesObj(),
		timeout,
		timeoutActive = false,
		self = this;

	this.get = function(preferenceName) {
		var rawPreferences = stubFunctions.genericRetrieve_preferencesObj();
		if(preferenceName === 'ServerURL')
			return rawPreferences.ServerURL;
		return preferences[preferenceName];
	};
	this.set = function(name, value) {
		if(name === 'ServerURL')
			return;
		preferences[name] = value;
		if(timeoutActive)
		{
			timeoutActive = false;
			clearTimeout(timeout);
		}
		timeout = setTimeout(function(){
			$MS.UpdateServerSavedPreferences(preferences,{});
			timeoutActive = false;
		}, 200);
		timeoutActive = true;
	};

	this.fetch = function(completeCallback) {
		$MS.retrieveServerSavedPreferences({success: function(response) {
			var serverPreferences = response.data.preferences;
			$.extend(preferences, serverPreferences);
			if(completeCallback !== undefined)
				completeCallback(preferences);
		}})
	}
}
var $MP = new MintSyncPreferences();
