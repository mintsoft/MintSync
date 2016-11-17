function MS_StubFunctions(){
//function stub for opera.extension.postMessage
this.genericPostMessage = function(objToSend){
	
}

//stub to access opera.extension.bgProcess.mintSyncGlobals
this.genericRetrieve_mintSyncGlobals = function(callback){
	callback({});
}

this.genericRetrieve_preferencesObj = function(){

}

this.genericRetrieve_currentTab = function(callback){
	callback(null);
}
}

var stubFunctions = new MS_StubFunctions();