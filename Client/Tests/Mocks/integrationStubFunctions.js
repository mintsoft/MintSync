//function stub for opera.extension.postMessage
function genericPostMessage(objToSend){
	
}

//stub to access opera.extension.bgProcess.mintSyncGlobals
function genericRetrieve_mintSyncGlobals(){
	return {};
}

//temporary stub to hardcode sensible defaults for server-side interface
function genericRetrieve_preferencesObj(){
	return { 
		'ServerURL' : '../../../ServerUI',
		'SavePassword' : '0.5',
		'SaveAuthentication' : '0.5'
	};
}

function genericRetrieve_currentTab(callback){
	callback(null);
}

/**
	Substitute for Prompt, used for passwords
*/
function askForPassword(prompt,completeCallback)
{
	completeCallback("password");
}
/**
	Substitute for Prompt used for authentication (un/pass)
*/
function askForUsernamePassword(prompt,completeCallback)
{
	g_serverURL = (genericRetrieve_preferencesObj()).ServerURL;
	completeCallback({
		'username': "robtest",
		'password':	"password"
	});
}
