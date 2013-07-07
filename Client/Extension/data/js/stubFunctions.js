//function stub for opera.extension.postMessage
function genericPostMessage(objToSend){
	
}

//stub to access opera.extension.bgProcess.mintSyncGlobals
function genericRetrieve_mintSyncGlobals(){
	return {};	//TODO Implement this
}

function genericRetrieve_preferencesObj(){
	return localStorage;	//TODO check this persists and is correct for addons
}

function genericRetrieve_currentTab(callback){
	alert("genericRetrieve_currentTab called");
	self.port.on("currentURL", function(e) {
		alert("currentURL callback fired! "+e);
		callback(e);
	});
	self.port.emit("getURL");
}
