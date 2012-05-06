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