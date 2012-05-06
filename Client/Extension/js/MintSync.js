//required otherwise jQuery attempts to stop the cross domain request
jQuery.support.cors = true;

//is the ctrl key down?
var g_ctrlDown = false;

/** 
	MintSync Object
*/
function MintSync() {
	this.rememberedPassword = undefined,
	/*
		Retrieve passwords for the passed domain
	*/
	this.getPasswords = function(Domain, callbacks) {
		$MS.getAuthenticationObject(function(authObj){
			$.ajax({
				type: "GET",
				data: {URL:Domain},
				cache: false,
				url:$MS.getServerURL()+"?AJAX=true&action=retrieve",
				beforeSend: function(jq,settings) {
					if($MS.getServerURL()==="https://example.com/mypasswords/")
					{
						alert("Please configure the Server URL");
						return false;
					}
					//add the headers for the auth:
					$MS.configureAuth(jq,settings,authObj);
					
					if(callbacks.beforeSend != undefined)
						callbacks.beforeSend(jq,settings);
				},
				complete: function(jq,textStatus) {
					if(callbacks.complete != undefined)
						callbacks.complete(jq,textStatus);
				},
				error: function(jq,textStatus,errorThrown) {
					console.error(jq.status);
					if(jq.status==401)	//incorrect credentials
					{
						$MS.resetSavedCredentials();
					}
					if(callbacks.error != undefined)
						callbacks.error(jq,textStatus,errorThrown);
				},
				success: function(data,textStatus,jq) {
					if(callbacks.success != undefined)
						callbacks.success(data);
				}
			});
		});
		
	},
	/*
		Retrieve passwords for the passed ID
	*/
	this.getPasswordsByID = function(IDnum, callbacks) {
		$MS.getAuthenticationObject(function(authObj){
			$.ajax({
				type: "GET",
				data: {ID:IDnum},
				cache: false,
				url:$MS.getServerURL()+"?AJAX=true&action=retrieve",
				beforeSend: function(jq,settings) {
					if($MS.getServerURL()==="https://example.com/mypasswords/")
					{
						alert("Please configure the Server URL");
						return false;
					}
					//add the headers for the auth:
					$MS.configureAuth(jq,settings,authObj);
					
					if(callbacks.beforeSend != undefined)
						callbacks.beforeSend(jq,settings);
				},
				complete: function(jq,textStatus) {
					if(callbacks.complete != undefined)
						callbacks.complete(jq,textStatus);
				},
				error: function(jq,textStatus,errorThrown) {
					console.error(jq.status);
					if(jq.status==401)	//incorrect credentials
					{
						$MS.resetSavedCredentials();
					}
					if(callbacks.error != undefined)
						callbacks.error(jq,textStatus,errorThrown);
				},
				success: function(data,textStatus,jq) {
					if(callbacks.success != undefined)
						callbacks.success(data);
				}
			});
		});
		
	},
	/*
		Retrieve passwords for the passed domain
	*/
	this.checkIfPasswordsExist = function(Domain,callbacks) {
		if(!$MS.checkForSavedAuth())
		{
			console.info("No Saved Authenticaiton, checkIfPasswordsExist cancelled");
			return false;
		}
		
		$MS.getAuthenticationObject(function(authObj){
			$.ajax({
				type: "GET",
				data: {URL:Domain},
				cache: false,
				url:$MS.getServerURL()+"?AJAX=true&action=check",
				beforeSend: function(jq,settings) {
					if($MS.getServerURL()==="https://example.com/mypasswords/")
					{
						alert("Please configure the Server URL");
						return false;
					}
					//add the headers for the auth:
					//returns false if there are no saved credentials
					//so return false to cancel the request
					if(!$MS.configureAuth(jq,settings,authObj))
					{
						//console.info("Check URL Request cancelled, no auth");
						return false
					}
					//console.info("Check URL Request  sent, auth available");
					if(callbacks.beforeSend != undefined)
						callbacks.beforeSend(jq,settings);
				},
				complete: function(jq,textStatus) {
				//console.info("Check URL Request  complete");
					if(callbacks.complete != undefined)
						callbacks.complete(jq,textStatus);
				},
				error: function(jq,textStatus,errorThrown) {
					if(jq.status==401)	//incorrect credentials
					{
						$MS.resetSavedCredentials();
					}
				//console.info("Check URL Request  errors");
					if(callbacks.error != undefined)
						callbacks.error(jq,textStatus,errorThrown);
				},
				success: function(data,textStatus,jq) {
				//console.info("Check URL Request  success");
					if(callbacks.success != undefined)
						callbacks.success(data);
				}
			});
		});
		
	},
	/*
		Retrieve passwords for the passed domain
	*/
	this.listURLS = function(callbacks) {
		$MS.getAuthenticationObject(function(authObj){
					
			$.ajax({
				type: "GET",
				url:$MS.getServerURL()+"?AJAX=true&action=list",
				cache: false,
				beforeSend: function(jq,settings) {
					if($MS.getServerURL()==="https://example.com/mypasswords/")
					{
						alert("Please configure the Server URL");
						return false;
					}
					//add the headers for the auth:
					$MS.configureAuth(jq,settings,authObj);
					
					if(callbacks.beforeSend != undefined)
						callbacks.beforeSend(jq,settings);
				},
				complete: function(jq,textStatus) {
					if(callbacks.complete != undefined)
						callbacks.complete(jq,textStatus);
				},
				error: function(jq,textStatus,errorThrown) {
					if(jq.status==401)	//incorrect credentials
					{
						$MS.resetSavedCredentials();
					}
					if(callbacks.error != undefined)
						callbacks.error(jq,textStatus,errorThrown);
				},
				success: function(data,textStatus,jq) {
					if(callbacks.success != undefined)
						callbacks.success(data);
				}
			});
		});
	},
	/**
		Performs the AJAX request saving the password
	*/
	this.setPassword = function(Domain,Credentials,rowSalt,cryptoHash,force,callbacks) {
		$MS.getAuthenticationObject(function(authObj){
			$.ajax({
				type: "POST",
				data: {
					"URL":Domain,
					"Credentials":Credentials,
					"rowSalt":rowSalt,
					"cryptoHash":cryptoHash,
					"force":force
				},
				cache: false,
				url:$MS.getServerURL()+"?AJAX=true&action=save",
				beforeSend: function(jq,settings) {
					if($MS.getServerURL()==="https://example.com/mypasswords/")
					{
						alert("Please configure the Server URL");
						return false;
					}
					//add the headers for the auth:
					$MS.configureAuth(jq,settings,authObj);
					
					if(callbacks.beforeSend != undefined)
						callbacks.beforeSend(jq,settings);
				},
				complete: function(jq,textStatus) {
					if(callbacks.complete != undefined)
						callbacks.complete(jq,textStatus);
				},
				error: function(jq,textStatus,errorThrown) {
					if(jq.status==401)	//incorrect credentials
					{
						$MS.resetSavedCredentials();
					}
					if(callbacks.error != undefined)
						callbacks.error(jq,textStatus,errorThrown);
				},
				success: function(data,textStatus,jq) {
					if(callbacks.success != undefined)
						callbacks.success(data,textStatus,jq);
				}
			});
		});
		
	},	
	/** removes the password with the request ID */
	
	this.removePasswords = function(ID,url,callbacks) {
		$MS.getAuthenticationObject(function(authObj){
			$.ajax({
				type: "DELETE",
				url:$MS.getServerURL()+"?AJAX=true&action=remove&ID="+ID,
				cache: false,
				beforeSend: function(jq,settings) {
					if($MS.getServerURL()==="https://example.com/mypasswords/")
					{
						alert("Please configure the Server URL");
						return false;
					}
					//add the headers for the auth:
					$MS.configureAuth(jq,settings,authObj);
					
					if(callbacks.beforeSend != undefined)
						callbacks.beforeSend(jq,settings);
				},
				complete: function(jq,textStatus) {
					if(callbacks.complete != undefined)
						callbacks.complete(jq,textStatus);
				},
				error: function(jq,textStatus,errorThrown) {
					if(jq.status==401)	//incorrect credentials
					{
						$MS.resetSavedCredentials();
					}
					if(callbacks.error != undefined)
						callbacks.error(jq,textStatus,errorThrown);
				},
				success: function(data,textStatus,jq) {
					if(callbacks.success != undefined)
						callbacks.success(data);
				}
			});
		});
		
	},
	/**
		Performs the AJAX request renaming the URL with the ID passed
	*/
	this.renameURL = function(ID,newDomain,callbacks) {
		$MS.getAuthenticationObject(function(authObj){
			$.ajax({
				type: "PUT",
				data: {"ID":ID,"newURL":newDomain},
				url:$MS.getServerURL()+"?AJAX=true&action=rename",
				cache: false,
				beforeSend: function(jq,settings) {
					if($MS.getServerURL()==="https://example.com/mypasswords/")
					{
						alert("Please configure the Server URL");
						return false;
					}
					//add the headers for the auth:
					$MS.configureAuth(jq,settings,authObj);
					
					if(callbacks.beforeSend != undefined)
						callbacks.beforeSend(jq,settings);
				},
				complete: function(jq,textStatus) {
					if(callbacks.complete != undefined)
						callbacks.complete(jq,textStatus);
				},
				error: function(jq,textStatus,errorThrown) {
					if(jq.status==401)	//incorrect credentials
					{
						$MS.resetSavedCredentials();
					}
					if(callbacks.error != undefined)
						callbacks.error(jq,textStatus,errorThrown);
				},
				success: function(data,textStatus,jq) {
					if(callbacks.success != undefined)
						callbacks.success(data);
				}
			});
		});
	},
	/**
		Takes a password hash and verifies it against the copy kept serverside
	*/
	this.verifyCryptoPass = function(passwordHash,callbacks) {
	
		//do hash the password again (so it is double hashed)
		passwordHash = hashPass(passwordHash);
	
		$MS.getAuthenticationObject(function(authObj){
			$.ajax({
				type: "GET",
				data: {"cryptoHash":passwordHash},
				url: $MS.getServerURL()+"?AJAX=true&action=confirmCrypto",
				cache: false,
				beforeSend: function(jq,settings) {
					if($MS.getServerURL()==="https://example.com/mypasswords/")
					{
						alert("Please configure the Server URL");
						return false;
					}
					//add the headers for the auth:
					$MS.configureAuth(jq,settings,authObj);
					
					if(callbacks.beforeSend != undefined)
						callbacks.beforeSend(jq,settings);
				},
				complete: function(jq,textStatus) {
					if(callbacks.complete != undefined)
						callbacks.complete(jq,textStatus);
				},
				error: function(jq,textStatus,errorThrown) {
					if(jq.status==401)	//incorrect credentials
					{
						$MS.resetSavedCredentials();
					}
					else if(jq.status==417) //Hash doesn't match
					{
							
					}
					if(callbacks.error != undefined)
						callbacks.error(jq,textStatus,errorThrown);
				},
				success: function(data,textStatus,jq) {
					if(callbacks.success != undefined)
						callbacks.success(data);
				}
			});
		});
		
	},
	/** 
		Retrieves the keySlot password for the user 
	*/
	this.getKeySlot = function(callbacks) {
		$MS.getAuthenticationObject(function(authObj){
			$.ajax({
				type: "GET",
				url:$MS.getServerURL()+"?AJAX=true&action=retrieveKeySlot0",
				cache: false,
				beforeSend: function(jq,settings) {
					if($MS.getServerURL()==="https://example.com/mypasswords/")
					{
						alert("Please configure the Server URL");
						return false;
					}
					//add the headers for the auth:
					$MS.configureAuth(jq,settings,authObj);
					
					if(callbacks.beforeSend != undefined)
						callbacks.beforeSend(jq,settings);
				},
				complete: function(jq,textStatus) {
					if(callbacks.complete != undefined)
						callbacks.complete(jq,textStatus);
				},
				error: function(jq,textStatus,errorThrown) {
					if(jq.status==401)	//incorrect credentials
					{
						$MS.resetSavedCredentials();
					}
					if(callbacks.error != undefined)
						callbacks.error(jq,textStatus,errorThrown);
				},
				success: function(data,textStatus,jq) {
					if(callbacks.success != undefined)
						callbacks.success(data);
				}
			});
		});
	},
	/**
		Performs the AJAX request saving the password
	*/
	this.setKeySlot = function(newKeySlot, newKeySlot0PassHash, callbacks) {
		$MS.getAuthenticationObject(function(authObj){
			$.ajax({
				type: "PUT",
				data: {
					"newKeySlot":newKeySlot,
					"newKeySlot0PassHash":newKeySlot0PassHash,
				},
				cache: false,
				url:$MS.getServerURL()+"?AJAX=true&action=setKeySlot",
				beforeSend: function(jq,settings) {
					if($MS.getServerURL()==="https://example.com/mypasswords/")
					{
						alert("Please configure the Server URL");
						return false;
					}
					//add the headers for the auth:
					$MS.configureAuth(jq,settings,authObj);
					
					if(callbacks.beforeSend != undefined)
						callbacks.beforeSend(jq,settings);
				},
				complete: function(jq,textStatus) {
					if(callbacks.complete != undefined)
						callbacks.complete(jq,textStatus);
				},
				error: function(jq,textStatus,errorThrown) {
					if(jq.status==401)	//incorrect credentials
					{
						$MS.resetSavedCredentials();
					}
					if(callbacks.error != undefined)
						callbacks.error(jq,textStatus,errorThrown);
				},
				success: function(data,textStatus,jq) {
					if(callbacks.success != undefined)
						callbacks.success(data,textStatus,jq);
				}
			});
		});
		
	},	
	/** 
		Takes a jQuery AJAX object and does the voodoo to the headers for auth 
		last argument is whether to prompt or not
		
		Authorisation: MintSync1 Username+"|"+Nonce+"|"+ Base64EncodedAuthString
		base64EncodedAuthString = SHA512.b64(SHA512.hex(Password)+":"+Nonce)
		
	*/
	this.configureAuth = function(jqXHR,settings,AuthObject) {
		//AuthObject contains the username and SHA-512 of the password
		var	shaObj,hash,
			authStr = "",
			nonce = $MS.generateRowSalt();
		
		authStr	 = AuthObject.username+"|"+nonce+"|";
		hash = AuthObject.password;
		
		shaObj	 = new jsSHA(hash+":"+nonce,"ASCII");
		authStr	+= shaObj.getHash("SHA-512","B64");
		jqXHR.setRequestHeader("X-MS-Authorisation", "MintSync1 "+authStr);
		return true;
	},
	/**
		Returns the hash of the password as a string of hex digits
	*/
	this.hashPass = function(passwd) {
		var shaObj = new jsSHA(passwd, "ASCII");
		return shaObj.getHash("SHA-512", "HEX");
	},	
	/**
		Returns a string type that contains a hex representation of 
			the password hash (SHA-512), this is the MASTER Key used
			to unlock the keySlot
	*/
	this.getEncryptionPasswordHash = function(successCallback) {
		//text to appear on the password prompt
		var strPrompt = "Enter your crypto password",
			preferences = genericRetrieve_preferencesObj();	//generic preferences object
		
		if(preferences["SavePassword"]==1)
		{
			if(!preferences["SavedPassword"] || preferences["SavedPassword"]==="undefined")
				askForPassword(strPrompt,function(password){
					var hash  = $MS.hashPass(password);
					preferences["SavedPassword"] = hash;
					successCallback(preferences["SavedPassword"]);
				});
			else
				successCallback(preferences["SavedPassword"]);
		}
		else if (preferences["SavePassword"]==0.8)
		{
			var passwd;
			//get the password from the background process
			passwd = genericRetrieve_mintSyncGlobals().passwd;
			if(passwd==undefined)
			{
				askForPassword(strPrompt,function(password){
					var hash  = $MS.hashPass(password);
					
					//set the password in the background process
					genericRetrieve_mintSyncGlobals().passwd = hash;
					
					//if required, start the background process timer
					if(preferences["SavePassBDuration"])
					{
						console.debug("SavePassBDuration is true");
						genericPostMessage({
							'action': 'startPasswdResetTimer',
							'src' : 'all',
						});
					}
					
					successCallback(hash);
				});
			}
			else
			{
				successCallback(passwd);
			}
				
		}
		else if (preferences["SavePassword"]==0.5)
		{
			//request password and store in global
			if($MS.rememberedPassword==undefined)
				askForPassword(strPrompt,function(password){
					$MS.rememberedPassword = $MS.hashPass(password);
					successCallback($MS.rememberedPassword);
				});
			else
				successCallback($MS.rememberedPassword);
		}
		else 
		{
			askForPassword(strPrompt,function(password){
				successCallback($MS.hashPass(password));
			});
		}
	},
	/**
		Returns a boolean representing whether or not we have any credentials saved
	**/
	this.checkForSavedAuth = function() {
		var preferences = genericRetrieve_preferencesObj();
		
		switch(preferences["SaveAuthentication"])
		{
			case "1":
				return !(preferences["SavedAuthentication"]=="undefined" && preferences["SavedAuthentication"]);
			break;
			case "0.8":
				if(opera.extension.bgProcess == undefined) // being called from the bgProcess
				{
					return mintSyncGlobals.authentication !== undefined;
				}
				else
				{
					return genericRetrieve_mintSyncGlobals().authentication !== undefined;
				}
			break;
			case "0.5":
				return $MS.rememberedAuthentication!==undefined
			break;
			case "0":
			default:
				return false;
		}
	},
	
	/**
		Will retrieve the authentication credentials if saved and request for them if not
	*/
	this.getAuthenticationObject = function(authCallback) {
		var promptStr = "Please enter your login details";
		var preferences = genericRetrieve_preferencesObj();
		
		if(preferences["SaveAuthentication"]==1)
		{
			if(!$MS.checkForSavedAuth())
			{
				askForUsernamePassword(promptStr,function(authObj){
					authObj.password = $MS.hashPass(authObj.password);
					preferences["SavedAuthentication"] = JSON.stringify(authObj);
					authCallback($.parseJSON(preferences["SavedAuthentication"]));
				});
			}
			else
			{
				authCallback($.parseJSON(preferences["SavedAuthentication"]));
			}
		}
		else if (preferences["SaveAuthentication"]==0.8)
		{
				
			if(!$MS.checkForSavedAuth())
			{
				if(opera.extension.bgProcess == undefined) // being called from the bgProcess
					return;
				
				askForUsernamePassword(promptStr,function(authObj){
					authObj.password = $MS.hashPass(authObj.password);
					//set the password in the background process
					
					if(opera.extension.bgProcess == undefined) // being called from the bgProcess
						mintSyncGlobals.authentication = authObj;
					else
						genericRetrieve_mintSyncGlobals().authentication = authObj;
					
					
					//start the password reset timer if applicable
					if(preferences["SavePassBDuration"] > 0)
					{
						//start the timer
						genericPostMessage({
							'action': 'startPasswdResetTimer',
							'src' : 'popup',
						});	
					}
					
					authCallback(authObj);
				});
			}
			else
			{
				if(opera.extension.bgProcess == undefined) // being called from the bgProcess
				{	
					authCallback(mintSyncGlobals.authentication);
				}
				else
				{	
					authCallback(genericRetrieve_mintSyncGlobals().authentication);
				}
				
			}
				
			
		}
		else if (preferences["SaveAuthentication"]==0.5)
		{
			//request password and store in global
			if(!$MS.checkForSavedAuth())
			{
				askForUsernamePassword(promptStr,function(authObj){
					authObj.password = $MS.hashPass(authObj.password);
					$MS.rememberedAuthentication = authObj;
					authCallback(authObj);
				});
			}
			else
			{
				authCallback($MS.rememberedAuthentication);
			}
		}
		else
		{
			askForUsernamePassword(promptStr, function(authObj){
				authObj.password = $MS.hashPass(authObj.password);
				authCallback(authObj);
			});
		}
	},	
	/**
		Resets the credentials saved (however they are)
	*/
	this.resetSavedCredentials = function() {
		var preferences = genericRetrieve_preferencesObj();
		
		switch(preferences["SaveAuthentication"])
		{
			case "1":
				preferences["SavedAuthentication"]="undefined";
			break;
			case "0.8":
				if(opera.extension.bgProcess == undefined) // being called from the bgProcess
				{
					mintSyncGlobals.authentication = undefined;
				}
				else
				{
					genericRetrieve_mintSyncGlobals().authentication = undefined;
				}
				
			break;
			case "0.5":
				$MS.rememberedAuthentication=undefined
			break;
			case "0":
			default:
		}
	},	
	/**
		Resets the crypto password saved (however they are)
	*/
	this.resetSavedCryptoPassword = function() {
		var preferences = genericRetrieve_preferencesObj();
		switch(preferences["SavePassword"])
		{
			case "1":
				preferences["SavedPassword"]="undefined";
			break;
			case "0.8":
				if(opera.extension.bgProcess == undefined) // being called from the bgProcess
				{
					mintSyncGlobals.passwd = undefined;
				}
				else
				{
					genericRetrieve_mintSyncGlobals().passwd = undefined;
				}
				
			break;
			case "0.5":
				$MS.rememberedPassword=undefined
			break;
			case "0":
			default:
		}
	},
	/** 
		Returns whether or not a password should be automatically 
		retrieved when the pop up is launched or not.
	**/
	this.getAutoFetch = function() {
		var preferences = genericRetrieve_preferencesObj();
		return preferences["AutoFetch"];
	},
	/** 
		Returns whether or not the user wants to be notified when 
		there is a password on the page or not
	**/
	this.getNotify = function() {
		var preferences = genericRetrieve_preferencesObj();
		return preferences["Notify"]=="1";
	},
	/**
		Get the Server's base URL
	*/
	this.getServerURL = function() {
		var preferences = genericRetrieve_preferencesObj();
		return preferences["ServerURL"];
	},
	/**
		Returns the password length configured
	*/
	this.getGeneratedPasswordLength = function() {
		var preferences = genericRetrieve_preferencesObj();
		return (typeof(preferences)==="undefined")?16:preferences["GeneratedPasswordLength"];
	},
	/**
		Returns the length the row salt should be generated to
	*/
	this.getGeneratedRowSaltLength = function() {
		return 32;
	},
	/**
	Generates a random salt string
	*/
	this.generateRowSalt = function() {
		//	return "6";		//chosen by random dice roll, guaranteed to be random
		//| is not in this sourceSet because its used as a delimiter for the auth
		var sourceSet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`~!@#$%^&*()-_=+[{]}\\;:'\",<.>/?",
			length = $MS.getGeneratedRowSaltLength(), 
			salt="";
			
		for(var x=0;x<length;++x)
		{
			var index = Math.floor(Math.random()*sourceSet.length);
			salt+= sourceSet.substr(index,1);
		}
		
		return salt;
	},
	/**
	Generates a random password string
	*/
	this.generatePassword = function(length) {
		var sourceSet = { 	"num"	: "1234567890", 
							"alpha"	: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
							"punc1"	: ";'#,./[]-=\\",
							"punc2"	: "`~@$%^&*()_+{}|:\"<>!?",
						 },
			password="",
			sourceString="",
			preferences = genericRetrieve_preferencesObj();
		
		//build	sourceString from preferences
		sourceString = sourceSet.alpha;
		
		sourceString += preferences["passwordStrengthNum"]	== "true"?sourceSet.num:"";
		sourceString += preferences["passwordStrengthPunc1"]	== "true"?sourceSet.punc1:"";
		sourceString += preferences["passwordStrengthPunc2"]	== "true"?sourceSet.punc2:"";
		
		for(var x=0;x<length;++x)
		{
			var index = Math.floor(Math.random()*sourceString.length);
			password+= sourceString.substr(index,1);
		}
		
		return password;
	},
	
	//placeholder for the last element
	this.empty=null
};
$MS = new MintSync();
