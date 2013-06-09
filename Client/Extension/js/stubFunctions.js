
//function stub for opera.extension.postMessage
function genericPostMessage(objToSend){
	chrome.runtime.sendMessage(objToSend);
}

//stub to access opera.extension.bgProcess.mintSyncGlobals
function genericRetrieve_mintSyncGlobals(){
	return chrome.extension.getBackgroundPage().mintSyncGlobals;
}

function genericRetrieve_preferencesObj(){
	return localStorage;
}

function genericRetrieve_currentTab(callback){
	chrome.tabs.getSelected(null,callback);
}