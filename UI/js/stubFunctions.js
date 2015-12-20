function MS_StubFunctions(){
//function stub for opera.extension.postMessage
this.genericPostMessage = function(objToSend){
	
}

//stub to access opera.extension.bgProcess.mintSyncGlobals
this.genericRetrieve_mintSyncGlobals = function(){
	return {};
}

//temporary stub to hardcode sensible defaults for server-side interface
this.genericRetrieve_preferencesObj = function(){
	return { 
		'ServerURL' : g_serverURL,
		'SavePassword' : '0.5',
		'SaveAuthentication' : '0.5',
        'GeneratedPasswordLength' : '16'
	};

}

this.genericRetrieve_currentTab = function(callback){
	callback(null);
}
}

var stubFunctions = new MS_StubFunctions();