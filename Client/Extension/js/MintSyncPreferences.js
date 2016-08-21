
function MintSyncPreferences(){
	var preferences;
	this.get = function(preferenceName) {
		preferences = stubFunctions.genericRetrieve_preferencesObj();
		if(preferenceName != "SaveAuthentication")
		{
			$MS.retrieveServerSavedPreferences({success: function(data) { 
				preferences = $.extend({}, preferences, data.preferences);
			}})
		}
		return preferences[preferenceName];
	};
	this.set = function(name, value) {
		preferences[name] = value;

		$ms.UpdateServerSavedPreferences(preferences);
	};
}
var $MP = new MintSyncPreferences();
