/**
	Opera Specific implementation of generic 
	stub functions
*/

function genericPostMessage(objToSend){
	opera.extension.postMessage(objToSend);
}

function genericRetrieve_mintSyncGlobals(){
	return opera.extension.bgProcess.mintSyncGlobals;
}

function genericRetrieve_preferencesObj(){
	return typeof(widget)!=="undefined"?widget.preferences:{};
}

function genericRetrieve_currentTab(callback){
	callback(opera.extension.bgProcess.opera.extension.tabs.getFocused());
}