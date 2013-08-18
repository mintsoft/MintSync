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
	console.log("genericRetrieve_currentTab called");
	addon.port.on("currentURL", function(e) {
		console.log("currentURL callback fired! " , e);
		callback({ url: e});
	});
	addon.port.emit("getURL");
}
