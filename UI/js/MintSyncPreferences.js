
function MintSyncPreferences(){
	var preferences;
	this.get = function(preferenceName) {
		preferences = stubFunctions.genericRetrieve_preferencesObj();
		return preferences[preferenceName];
	};
	this.set = function(name, value) {
		preferences[name] = value;

		$ms.UpdateServerSavedPreferences(preferences);
	};

	this.fetch = function() {
		$MS.retrieveServerSavedPreferences({success: function(data) { 
			preferences = $.extend({}, preferences, data.preferences);
		}})
	}
}
var $MP = new MintSyncPreferences();
