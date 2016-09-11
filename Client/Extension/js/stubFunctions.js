function MS_StubFunctions(){
//function stub for opera.extension.postMessage
this.genericPostMessage = function(objToSend){
	
}

//stub to access opera.extension.bgProcess.mintSyncGlobals
this.genericRetrieve_mintSyncGlobals = function(){

}

this.genericRetrieve_preferencesObj = function(){
	return {};
}

this.genericRetrieve_currentTab = function(callback){
	callback(null);
}
}

var stubFunctions = new MS_StubFunctions();