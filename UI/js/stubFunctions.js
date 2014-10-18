
//function stub for opera.extension.postMessage
function genericPostMessage(objToSend){
	
}

//stub to access opera.extension.bgProcess.mintSyncGlobals
function genericRetrieve_mintSyncGlobals(){
	return {};
}

//temporary stub to hardcode sensible defaults for server-side interface
function genericRetrieve_preferencesObj(){
	return { 
		'ServerURL' : g_serverURL,
		'SavePassword' : '0.5',
		'SaveAuthentication' : '0.5'
	};

}

function genericRetrieve_currentTab(callback){
	callback(null);
}