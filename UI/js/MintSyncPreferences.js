
function MintSyncPreferences(){
	var preferences;
	this.get = function(preferenceName) {
		preferences = stubFunctions.genericRetrieve_preferencesObj();
		return preferences[preferenceName];
	};
	this.set = function(name, value) {
		preferences[name] = value;
	};
}
var $MP = new MintSyncPreferences();
