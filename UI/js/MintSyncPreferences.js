
function MintSyncPreferences(){
	var preferences = {},
		timeout,
		timeoutActive = false;
	this.get = function(preferenceName) {
		preferences = stubFunctions.genericRetrieve_preferencesObj();
		return preferences[preferenceName];
	};
	this.set = function(name, value) {
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

	this.fetch = function() {
		$MS.retrieveServerSavedPreferences({success: function(response) {
			var serverPreferences = response.data.preferences;
			$.extend(preferences, serverPreferences);
		}})
	}
}
var $MP = new MintSyncPreferences();
