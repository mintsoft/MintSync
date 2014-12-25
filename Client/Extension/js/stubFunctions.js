function MS_StubFunctions(){
/**
	Opera Specific implementation of generic 
	stub functions
*/

this.genericPostMessage = function(objToSend){
	opera.extension.postMessage(objToSend);
}

this.genericRetrieve_mintSyncGlobals = function(){
	return opera.extension.bgProcess.mintSyncGlobals;
}

this.genericRetrieve_preferencesObj = function(){
	return typeof(widget)!=="undefined"?widget.preferences:{};
}

this.genericRetrieve_currentTab = function(callback){
	callback(opera.extension.bgProcess.opera.extension.tabs.getFocused());
}
}

var stubFunctions = new MS_StubFunctions();