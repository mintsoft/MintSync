
function MintSyncPreferences(){
	var preferences = stubFunctions.genericRetrieve_preferencesObj(),
		timeout,
		timeoutActive = false,
		self = this;

	this.get = function(preferenceName) {
		return preferences[preferenceName];
	};
	this.set = function(name, value) {
		self.preferences[name] = value;
		if(timeoutActive)
		{
			timeoutActive = false;
			clearTimeout(timeout);
		}
		timeout = setTimeout(function(){
			$MS.UpdateServerSavedPreferences(self.preferences,{});
			timeoutActive = false;
		}, 200);
		timeoutActive = true;
	};

	this.fetch = function() {
		$MS.retrieveServerSavedPreferences({success: function(response) {
			var serverPreferences = response.data.preferences;
			$.extend(self.preferences, serverPreferences);
		}})
	}
}
var $MP = new MintSyncPreferences();
