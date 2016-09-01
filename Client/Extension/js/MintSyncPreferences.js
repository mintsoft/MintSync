
function MintSyncPreferences(){
	var preferences = {};
	this.get = function(preferenceName) {
		preferences = stubFunctions.genericRetrieve_preferencesObj();
		return preferences[preferenceName];
	};
	this.set = function(name, value) {
		preferences[name] = value;

		$MS.UpdateServerSavedPreferences(preferences,{});
	};

	this.fetch = function() {
		$MS.retrieveServerSavedPreferences({success: function(response) {
			var serverPreferences = response.data.preferences;
			$.extend(preferences, serverPreferences);
		}})
	}
}
var $MP = new MintSyncPreferences();
