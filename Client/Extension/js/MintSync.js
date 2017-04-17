/* jshint sub:true */
//required otherwise jQuery attempts to stop the cross domain request
jQuery.support.cors = true;

//is the ctrl key down?
var g_ctrlDown = false;

/** 
	MintSync Object
*/
function MintSync(userPreferenceServiceProvider) {
	this.rememberedPassword = undefined;
	var userPreferences = userPreferenceServiceProvider;
	var self = this;
	/*
		Retrieve passwords for the passed domain
	*/
	this.getPasswords = function(Domain, callbacks) {
		self.getAuthenticationObject(function(authObj){
			$.ajax({
				type: "GET",
				data: {URL:Domain},
				cache: false,
				url:self.getServerURL() + "?AJAX=true&action=retrieve",
				beforeSend: function(jq,settings) {
					if(self.getServerURL()==="https://example.com/mypasswords/")
					{
						alert("Please configure the Server URL");
						return false;
					}
					//add the headers for the auth:
					self.configureAuth(jq,settings,authObj);
					
					if(callbacks.beforeSend !== undefined)
						callbacks.beforeSend(jq,settings);
				},
				complete: function(jq,textStatus) {
					if(callbacks.complete !== undefined)
						callbacks.complete(jq,textStatus);
				},
				error: function(jq,textStatus,errorThrown) {
					console.error(jq.status);
					if(jq.status==401)	//incorrect credentials
					{
						self.resetSavedCredentials();
					}
					if(callbacks.error !== undefined)
						callbacks.error(jq,textStatus,errorThrown);
				},
				success: function(data,textStatus,jq) {
					if(callbacks.success !== undefined)
						callbacks.success(data);
				}
			});
		});
		
	};
	/*
		Retrieve passwords for the passed ID
	*/
	this.getPasswordsByID = function(IDnum, callbacks) {
		self.getAuthenticationObject(function(authObj){
			$.ajax({
				type: "GET",
				data: {ID:IDnum},
				cache: false,
				url:self.getServerURL()+"?AJAX=true&action=retrieve",
				beforeSend: function(jq,settings) {
					if(self.getServerURL()==="https://example.com/mypasswords/")
					{
						alert("Please configure the Server URL");
						return false;
					}
					//add the headers for the auth:
					self.configureAuth(jq,settings,authObj);
					
					if(callbacks.beforeSend !== undefined)
						callbacks.beforeSend(jq,settings);
				},
				complete: function(jq,textStatus) {
					if(callbacks.complete !== undefined)
						callbacks.complete(jq,textStatus);
				},
				error: function(jq,textStatus,errorThrown) {
					console.error(jq.status);
					if(jq.status==401)	//incorrect credentials
					{
						self.resetSavedCredentials();
					}
					if(callbacks.error !== undefined)
						callbacks.error(jq,textStatus,errorThrown);
				},
				success: function(data,textStatus,jq) {
					if(callbacks.success !== undefined)
						callbacks.success(data);
				}
			});
		});
		
	};
	/*
		Retrieve passwords for the passed domain
	*/
	this.checkIfPasswordsExist = function(Domain,callbacks) {
		self.checkForSavedAuth(function(){
			console.info("No Saved Authenticaiton, checkIfPasswordsExist cancelled");
			return false;
		}, function(){
			self.getAuthenticationObject(function(authObj){
				$.ajax({
					type: "GET",
					data: {URL:Domain},
					cache: false,
					url:self.getServerURL()+"?AJAX=true&action=check",
					beforeSend: function(jq,settings) {
						if(self.getServerURL()==="https://example.com/mypasswords/")
						{
							alert("Please configure the Server URL");
							return false;
						}
						//add the headers for the auth:
						//returns false if there are no saved credentials
						//so return false to cancel the request
						if(!self.configureAuth(jq,settings,authObj))
						{
							//console.info("Check URL Request cancelled, no auth");
							return false;
						}
						//console.info("Check URL Request  sent, auth available");
						if(callbacks.beforeSend !== undefined)
							callbacks.beforeSend(jq,settings);
					},
					complete: function(jq,textStatus) {
						//console.info("Check URL Request  complete");
						if(callbacks.complete !== undefined)
							callbacks.complete(jq,textStatus);
					},
					error: function(jq,textStatus,errorThrown) {
						if(jq.status==401)	//incorrect credentials
						{
							self.resetSavedCredentials();
						}
						//console.info("Check URL Request  errors");
						if(callbacks.error !== undefined)
							callbacks.error(jq,textStatus,errorThrown);
					},
					success: function(data,textStatus,jq) {
						//console.info("Check URL Request  success");
						if(callbacks.success !== undefined)
							callbacks.success(data);
					}
				});
			});
		});
	};
	/*
		Retrieve passwords for the passed domain
	*/
	this.listURLS = function(callbacks) {
		self.getAuthenticationObject(function(authObj){
					
			$.ajax({
				type: "GET",
				url:self.getServerURL()+"?AJAX=true&action=list",
				cache: false,
				beforeSend: function(jq,settings) {
					if(self.getServerURL()==="https://example.com/mypasswords/")
					{
						alert("Please configure the Server URL");
						return false;
					}
					//add the headers for the auth:
					self.configureAuth(jq,settings,authObj);
					
					if(callbacks.beforeSend !== undefined)
						callbacks.beforeSend(jq,settings);
				},
				complete: function(jq,textStatus) {
					if(callbacks.complete !== undefined)
						callbacks.complete(jq,textStatus);
				},
				error: function(jq,textStatus,errorThrown) {
					if(jq.status==401)	//incorrect credentials
					{
						self.resetSavedCredentials();
					}
					if(callbacks.error !== undefined)
						callbacks.error(jq,textStatus,errorThrown);
				},
				success: function(data,textStatus,jq) {
					if(callbacks.success !== undefined)
						callbacks.success(data);
				}
			});
		});
	};
	/**
		Performs the AJAX request saving the password
	*/
	this.setPassword = function(Domain,Credentials,rowSalt,cryptoHash,force,cryptoScheme,callbacks) {
		self.getAuthenticationObject(function(authObj){
			$.ajax({
				type: "POST",
				data: {
					"URL":Domain,
					"Credentials":Credentials,
					"rowSalt":rowSalt,
					"cryptoHash":cryptoHash,
					"cryptoScheme": cryptoScheme,
					"force":force
				},
				cache: false,
				url:self.getServerURL()+"?AJAX=true&action=save",
				beforeSend: function(jq,settings) {
					if(self.getServerURL()==="https://example.com/mypasswords/")
					{
						alert("Please configure the Server URL");
						return false;
					}
					//add the headers for the auth:
					self.configureAuth(jq,settings,authObj);
					
					if(callbacks.beforeSend !== undefined)
						callbacks.beforeSend(jq,settings);
				},
				complete: function(jq,textStatus) {
					if(callbacks.complete !== undefined)
						callbacks.complete(jq,textStatus);
				},
				error: function(jq,textStatus,errorThrown) {
					if(jq.status==401)	//incorrect credentials
					{
						self.resetSavedCredentials();
					}
					if(callbacks.error !== undefined)
						callbacks.error(jq,textStatus,errorThrown);
				},
				success: function(data,textStatus,jq) {
					if(callbacks.success !== undefined)
						callbacks.success(data,textStatus,jq);
				}
			});
		});
		
	};	
	/** removes the password with the request ID */
	
	this.removePasswords = function(ID,url,callbacks) {
		self.getAuthenticationObject(function(authObj){
			$.ajax({
				type: "DELETE",
				url:self.getServerURL()+"?AJAX=true&action=remove&ID="+ID,
				cache: false,
				beforeSend: function(jq,settings) {
					if(self.getServerURL()==="https://example.com/mypasswords/")
					{
						alert("Please configure the Server URL");
						return false;
					}
					//add the headers for the auth:
					self.configureAuth(jq,settings,authObj);
					
					if(callbacks.beforeSend !== undefined)
						callbacks.beforeSend(jq,settings);
				},
				complete: function(jq,textStatus) {
					if(callbacks.complete !== undefined)
						callbacks.complete(jq,textStatus);
				},
				error: function(jq,textStatus,errorThrown) {
					if(jq.status==401)	//incorrect credentials
					{
						self.resetSavedCredentials();
					}
					if(callbacks.error !== undefined)
						callbacks.error(jq,textStatus,errorThrown);
				},
				success: function(data,textStatus,jq) {
					if(callbacks.success !== undefined)
						callbacks.success(data);
				}
			});
		});
		
	};
	/**
		Performs the AJAX request renaming the URL with the ID passed
	*/
	this.renameURL = function(ID,newDomain,callbacks) {
		self.getAuthenticationObject(function(authObj){
			$.ajax({
				type: "PUT",
				data: {"ID":ID,"newURL":newDomain},
				url:self.getServerURL()+"?AJAX=true&action=rename",
				cache: false,
				beforeSend: function(jq,settings) {
					if(self.getServerURL()==="https://example.com/mypasswords/")
					{
						alert("Please configure the Server URL");
						return false;
					}
					//add the headers for the auth:
					self.configureAuth(jq,settings,authObj);
					
					if(callbacks.beforeSend !== undefined)
						callbacks.beforeSend(jq,settings);
				},
				complete: function(jq,textStatus) {
					if(callbacks.complete !== undefined)
						callbacks.complete(jq,textStatus);
				},
				error: function(jq,textStatus,errorThrown) {
					if(jq.status==401)	//incorrect credentials
					{
						self.resetSavedCredentials();
					}
					if(callbacks.error !== undefined)
						callbacks.error(jq,textStatus,errorThrown);
				},
				success: function(data,textStatus,jq) {
					if(callbacks.success !== undefined)
						callbacks.success(data);
				}
			});
		});
	};
	/**
		Takes a password hash and verifies it against the copy kept serverside
	*/
	this.verifyCryptoPass = function(passwordHash,callbacks) {
	
		//do hash the password again (so it is double hashed)
		passwordHash = self.hashPass(passwordHash);
	
		self.getAuthenticationObject(function(authObj){
			$.ajax({
				type: "GET",
				data: {"cryptoHash":passwordHash},
				url: self.getServerURL()+"?AJAX=true&action=confirmCrypto",
				cache: false,
				beforeSend: function(jq,settings) {
					if(self.getServerURL()==="https://example.com/mypasswords/")
					{
						alert("Please configure the Server URL");
						return false;
					}
					//add the headers for the auth:
					self.configureAuth(jq,settings,authObj);
					
					if(callbacks.beforeSend !== undefined)
						callbacks.beforeSend(jq,settings);
				},
				complete: function(jq,textStatus) {
					if(callbacks.complete !== undefined)
						callbacks.complete(jq,textStatus);
				},
				error: function(jq,textStatus,errorThrown) {
					if(jq.status==401)	//incorrect credentials
					{
						self.resetSavedCredentials();
					}
					else if(jq.status==417) //Hash doesn't match
					{
							
					}
					if(callbacks.error !== undefined)
						callbacks.error(jq,textStatus,errorThrown);
				},
				success: function(data,textStatus,jq) {
					if(callbacks.success !== undefined)
						callbacks.success(data);
				}
			});
		});
		
	};
	/** 
		Retrieves the keySlot password for the user 
	*/
	this.getKeySlot = function(callbacks) {
		self.getAuthenticationObject(function(authObj){
			$.ajax({
				type: "GET",
				url:self.getServerURL()+"?AJAX=true&action=retrieveKeySlot0",
				cache: false,
				beforeSend: function(jq,settings) {
					if(self.getServerURL()==="https://example.com/mypasswords/")
					{
						alert("Please configure the Server URL");
						return false;
					}
					//add the headers for the auth:
					self.configureAuth(jq,settings,authObj);
					
					if(callbacks.beforeSend !== undefined)
						callbacks.beforeSend(jq,settings);
				},
				complete: function(jq,textStatus) {
					if(callbacks.complete !== undefined)
						callbacks.complete(jq,textStatus);
				},
				error: function(jq,textStatus,errorThrown) {
					if(jq.status==401)	//incorrect credentials
					{
						self.resetSavedCredentials();
					}
					if(callbacks.error !== undefined)
						callbacks.error(jq,textStatus,errorThrown);
				},
				success: function(data,textStatus,jq) {
					if(callbacks.success !== undefined)
						callbacks.success(data);
				}
			});
		});
	};
	/**
		Performs the AJAX request saving the password
	*/
	this.setKeySlot = function(newKeySlot, newKeySlot0PassHash, callbacks) {
		self.getAuthenticationObject(function(authObj){
			$.ajax({
				type: "PUT",
				data: {
					"newKeySlot":newKeySlot,
					"newKeySlot0PassHash":newKeySlot0PassHash,
				},
				cache: false,
				url:self.getServerURL()+"?AJAX=true&action=setKeySlot",
				beforeSend: function(jq,settings) {
					if(self.getServerURL()==="https://example.com/mypasswords/")
					{
						alert("Please configure the Server URL");
						return false;
					}
					//add the headers for the auth:
					self.configureAuth(jq,settings,authObj);
					
					if(callbacks.beforeSend !== undefined)
						callbacks.beforeSend(jq,settings);
				},
				complete: function(jq,textStatus) {
					if(callbacks.complete !== undefined)
						callbacks.complete(jq,textStatus);
				},
				error: function(jq,textStatus,errorThrown) {
					if(jq.status==401)	//incorrect credentials
					{
						self.resetSavedCredentials();
					}
					if(callbacks.error !== undefined)
						callbacks.error(jq,textStatus,errorThrown);
				},
				success: function(data,textStatus,jq) {
					if(callbacks.success !== undefined)
						callbacks.success(data,textStatus,jq);
				}
			});
		});
		
	};

	/*
		Retrieves the options saved for the user server-side
	*/
	this.retrieveServerSavedPreferences = function(callbacks) {
		self.getAuthenticationObject(function(authObj){
					
			$.ajax({
				type: "GET",
				url:self.getServerURL()+"?AJAX=true&action=getUserPreferences",
				cache: false,
				beforeSend: function(jq,settings) {
					if(self.getServerURL()==="https://example.com/mypasswords/")
					{
						alert("Please configure the Server URL");
						return false;
					}
					//add the headers for the auth:
					self.configureAuth(jq,settings,authObj);
					
					if(callbacks.beforeSend !== undefined)
						callbacks.beforeSend(jq,settings);
				},
				complete: function(jq,textStatus) {
					if(callbacks.complete !== undefined)
						callbacks.complete(jq,textStatus);
				},
				error: function(jq,textStatus,errorThrown) {
					if(jq.status==401)	//incorrect credentials
					{
						self.resetSavedCredentials();
					}
					if(callbacks.error !== undefined)
						callbacks.error(jq,textStatus,errorThrown);
				},
				success: function(data,textStatus,jq) {
					if(callbacks.success !== undefined)
						callbacks.success(data);
				}
			});
		});
	};

	/*
		Updates the options saved against the user server-side
	*/
	this.UpdateServerSavedPreferences = function(preferences, callbacks) {
		self.getAuthenticationObject(function(authObj){
					
			$.ajax({
				type: "PUT",
				url:self.getServerURL()+"?AJAX=true&action=setUserPreferences",
				cache: false,
				data: {
					"preferences": preferences
				},
				beforeSend: function(jq,settings) {
					if(self.getServerURL()==="https://example.com/mypasswords/")
					{
						alert("Please configure the Server URL");
						return false;
					}
					//add the headers for the auth:
					self.configureAuth(jq,settings,authObj);
					
					if(callbacks.beforeSend !== undefined)
						callbacks.beforeSend(jq,settings);
				},
				complete: function(jq,textStatus) {
					if(callbacks.complete !== undefined)
						callbacks.complete(jq,textStatus);
				},
				error: function(jq,textStatus,errorThrown) {
					if(jq.status==401)	//incorrect credentials
					{
						self.resetSavedCredentials();
					}
					if(callbacks.error !== undefined)
						callbacks.error(jq,textStatus,errorThrown);
				},
				success: function(data,textStatus,jq) {
					if(callbacks.success !== undefined)
						callbacks.success(data);
				}
			});
		});
	};

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
			nonce = self.generateRowSalt();
		
		authStr = AuthObject.username+"|"+nonce+"|";
		hash = AuthObject.password;
		
		shaObj = new jsSHA(hash+":"+nonce,"ASCII");
		authStr	+= shaObj.getHash("SHA-512","B64");
		jqXHR.setRequestHeader("X-MS-Authorisation", "MintSync1 "+authStr);
		return true;
	};
	/**
		Returns the hash of the password as a string of hex digits
	*/
	this.hashPass = function(passwd) {
		var shaObj = new jsSHA(passwd, "ASCII");
		return shaObj.getHash("SHA-512", "HEX");
	};	
	/**
		Returns a string type that contains a hex representation of 
			the password hash (SHA-512), this is the MASTER Key used
			to unlock the keySlot
	*/
	this.getEncryptionPasswordHash = function(successCallback) {
		//text to appear on the password prompt
		var strPrompt = "Enter your crypto password";
		
		if(userPreferences.get("SavePassword") == 1)
		{
			if(!userPreferences.get("SavedPassword") || userPreferences.get("SavedPassword") === "undefined")
				lightboxes.askForPassword(strPrompt,function(password){
					var hash  = self.hashPass(password);
					userPreferences.set("SavedPassword", hash);
					successCallback(userPreferences.get("SavedPassword"));
				});
			else
				successCallback(userPreferences.get("SavedPassword"));
		}
		else if (userPreferences.get("SavePassword") == 0.8)
		{
			//get the password from the background process
			stubFunctions.genericRetrieve_mintSyncGlobals(function(genericRetrieveMintSyncGlobals){
				var passwd = genericRetrieveMintSyncGlobals.passwd;
				if(passwd === undefined)
				{
					lightboxes.askForPassword(strPrompt,function(password){
						var hash  = self.hashPass(password);

						//set the password in the background process
						genericRetrieveMintSyncGlobals.passwd = hash;

						//if required, start the background process timer
						if(userPreferences.get("SavePassBDuration"))
						{
							stubFunctions.genericPostMessage({
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
			});
		}
		else if (userPreferences.get("SavePassword") == 0.5)
		{
			//request password and store in global
			if(self.rememberedPassword === undefined)
				lightboxes.askForPassword(strPrompt,function(password){
					self.rememberedPassword = self.hashPass(password);
					successCallback(self.rememberedPassword);
				});
			else
				successCallback(self.rememberedPassword);
		}
		else 
		{
			lightboxes.askForPassword(strPrompt,function(password){
				successCallback(self.hashPass(password));
			});
		}
	};
	/**
		Returns a boolean representing whether or not we have any credentials saved
	**/
	this.checkForSavedAuth = function(savedCallback, notSavedCallback) {

		switch(userPreferences.get("SaveAuthentication"))
		{
			case "1":
				if(!(userPreferences.get("SavedAuthentication") == "undefined" && userPreferences.get("SavedAuthentication")))
					savedCallback(true);
			break;
			case "0.8":
				if(typeof(mintSyncGlobals) !== "undefined") // being called from the bgProcess
				{
					if(mintSyncGlobals.authentication !== undefined)
						savedCallback(true);
				}
				else
				{
					stubFunctions.genericRetrieve_mintSyncGlobals(function(x){
						if(x.authentication !== undefined)
							savedCallback(true);
					});
				}
			break;
			case "0.5":
				if(self.rememberedAuthentication !== undefined)
					savedCallback(true);
				else
					notSavedCallback(false);
			break;
			default:
					notSavedCallback(false);
		}
	};
	
	/**
		Will retrieve the authentication credentials if saved and request for them if not
	*/
	this.getAuthenticationObject = function(authCallback) {
		var promptStr = "Please enter your login details";
		
		if(userPreferences.get("SaveAuthentication") == 1)
		{
			self.checkForSavedAuth(function(){
				authCallback($.parseJSON(userPreferences.get("SavedAuthentication")));
			}, function(){
				lightboxes.askForUsernamePassword(promptStr,function(authObj){
					authObj.password = self.hashPass(authObj.password);
					userPreferences.set("SavedAuthentication", JSON.stringify(authObj));
					authCallback($.parseJSON(userPreferences.get("SavedAuthentication")));
				});
			});
		}
		else if (userPreferences.get("SaveAuthentication") == 0.8)
		{
			self.checkForSavedAuth(function(){
				if(typeof(mintSyncGlobals) !== "undefined") // being called from the bgProcess
				{
					authCallback(mintSyncGlobals.authentication);
				}
				else
				{
					stubFunctions.genericRetrieve_mintSyncGlobals(function(x) {
						authCallback(x.authentication);
					});

				}
			}, function(){
				if(typeof(mintSyncGlobals) !== "undefined") // being called from the bgProcess so don't prompt!
					return;

				lightboxes.askForUsernamePassword(promptStr,function(authObj){
					authObj.password = self.hashPass(authObj.password);
					//set the password in the background process

					if(typeof(mintSyncGlobals) !== "undefined") // being called from the bgProcess
						mintSyncGlobals.authentication = authObj;
					else
					{
						stubFunctions.genericRetrieve_mintSyncGlobals(function(x) {
							x.authentication = authObj;
						})
					}

					//start the password reset timer if applicable
					if(userPreferences.get("SavePassBDuration") > 0)
					{
						//start the timer
						stubFunctions.genericPostMessage({
							'action': 'startPasswdResetTimer',
							'src' : 'popup',
						});
					}

					authCallback(authObj);
				});
			});
		}
		else if (userPreferences.get("SaveAuthentication") == 0.5)
		{
			//request password and store in global
			self.checkForSavedAuth(function(){
				authCallback(self.rememberedAuthentication);
			}, function(){
				lightboxes.askForUsernamePassword(promptStr,function(authObj){
					authObj.password = self.hashPass(authObj.password);
					self.rememberedAuthentication = authObj;
					authCallback(authObj);
				});
			});
		}
		else
		{
			lightboxes.askForUsernamePassword(promptStr, function(authObj){
				authObj.password = self.hashPass(authObj.password);
				authCallback(authObj);
			});
		}
	};	
	/**
		Resets the credentials saved (however they are)
	*/
	this.resetSavedCredentials = function() {
		switch(userPreferences.get("SaveAuthentication"))
		{
			case "1":
				userPreferences.set("SavedAuthentication", "undefined");
			break;
			case "0.8":
				if(typeof(mintSyncGlobals) !== "undefined") // being called from the bgProcess
				{
					mintSyncGlobals.authentication = undefined;
				}
				else
				{
					stubFunctions.genericRetrieve_mintSyncGlobals(function(genericRetrieveMintSyncGlobals){
						genericRetrieveMintSyncGlobals.authentication = undefined;
					});
				}
				
			break;
			case "0.5":
				self.rememberedAuthentication = undefined;
			break;
			default:
		}
	};	
	/**
		Resets the crypto password saved (however they are)
	*/
	this.resetSavedCryptoPassword = function() {
		switch(userPreferences.get("SavePassword"))
		{
			case "1":
				userPreferences.set("SavedPassword", "undefined");
			break;
			case "0.8":
				if(typeof(mintSyncGlobals) !== "undefined") // being called from the bgProcess
				{
					mintSyncGlobals.passwd = undefined;
				}
				else
				{
					stubFunctions.genericRetrieve_mintSyncGlobals(function(genericRetrieveMintSyncGlobals){
						genericRetrieveMintSyncGlobals.passwd = undefined;
					});
				}
				
			break;
			case "0.5":
				self.rememberedPassword = undefined;
			break;
			default:
		}
	};
	/** 
		Returns whether or not a password should be automatically 
		retrieved when the pop up is launched or not.
	**/
	this.getAutoFetch = function() {
		return userPreferences.get("AutoFetch");
	};
	/** 
		Returns whether or not the user wants to be notified when 
		there is a password on the page or not
	**/
	this.getNotify = function() {
		return userPreferences.get("Notify") == "1";
	};
	/**
		Get the Server's base URL
	*/
	this.getServerURL = function() {
		return userPreferences.get("ServerURL");
	};
	/**
		Returns the password length configured
	*/
	this.getGeneratedPasswordLength = function() {
		var length = userPreferences.get("GeneratedPasswordLength");
		return typeof(length) === undefined ? 16: length;
	};
	/**
		Returns the length the row salt should be generated to
	*/
	this.getGeneratedRowSaltLength = function() {
		return 32;
	};
	/**
	Generates a random salt string
	*/
	this.generateRowSalt = function() {
		//	return "6";		//chosen by random dice roll, guaranteed to be random
		//| is not in this sourceSet because its used as a delimiter for the auth
		var sourceSet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`~!@#$%^&*()-_=+[{]}\\;:'\",<.>/?",
			length = self.getGeneratedRowSaltLength(), 
			salt="";
			
		for(var x=0;x<length;++x)
		{
			var index = Math.floor(Math.random()*sourceSet.length);
			salt+= sourceSet.substr(index,1);
		}
		
		return salt;
	};
	/**
	Generates a random password string
	*/
	this.generatePassword = function(length) {
		var sourceSet = {	"num"	: "1234567890", 
							"alpha"	: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
							"punc1"	: ";'#,./[]-=\\",
							"punc2"	: "`~@$%^&*()_+{}|:\"<>!?",
						},
			password="",
			sourceString="";
		
		//build	sourceString from preferences
		sourceString = sourceSet.alpha;
		
		sourceString += userPreferences.get("passwordStrengthNum") == "true" ? sourceSet.num : "";
		sourceString += userPreferences.get("passwordStrengthPunc1") == "true" ? sourceSet.punc1 : "";
		sourceString += userPreferences.get("passwordStrengthPunc2") == "true" ? sourceSet.punc2 : "";
		
		for(var x=0;x<length;++x)
		{
			var index = Math.floor(Math.random()*sourceString.length);
			password+= sourceString.substr(index,1);
		}
		
		return password;
	};
}

var $MS = new MintSync($MP);
