function MS_StubFunctions(){
	//function stub for opera.extension.postMessage
	this.genericPostMessage = function(objToSend){
		chrome.runtime.sendMessage(objToSend);
	}

	//stub to access opera.extension.bgProcess.mintSyncGlobals
	this.genericRetrieve_mintSyncGlobals = function(){
		return chrome.extension.getBackgroundPage().mintSyncGlobals;
	}

	this.genericRetrieve_preferencesObj = function(){
		return localStorage;
	}

	this.genericRetrieve_currentTab = function(callback){
		chrome.tabs.getSelected(null,callback);
	}
}

var stubFunctions = new MS_StubFunctions();