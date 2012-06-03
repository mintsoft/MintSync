
//function stub for opera.extension.postMessage
function genericPostMessage(objToSend){
	
}

//stub to access opera.extension.bgProcess.mintSyncGlobals
function genericRetrieve_mintSyncGlobals(){

}

function genericRetrieve_preferencesObj(){
	if( typeof localStorage["MintSync_preferencesObject"] === "undefined" )
		localStorage["MintSync_preferencesObject"] = {}
	return localStorage["MintSync_preferencesObject"];

}