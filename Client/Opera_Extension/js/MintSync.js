//required otherwise jQuery attempts to stop the cross domain request
jQuery.support.cors = true;

/** 
	MintSync Object
*/
function MintSync() {
		
	/*
		Retrieve passwords for the passed domain
	*/
	this.getPasswords = function(Domain, callbacks) {
			
		$.ajax({
			type: "GET",
			data: {URL:Domain},
			url:this.getServerURL()+"?AJAX=true&action=retrieve",
			beforeSend: function(jq,settings) {
				//add the headers for the auth:
				$MS.configureAuth(jq,settings,true);
				
				if(callbacks.beforeSend != undefined)
					callbacks.beforeSend(jq,settings);
			},
			complete: function(jq,textStatus) {
				if(callbacks.complete != undefined)
					callbacks.complete(jq,textStatus);
			},
			error: function(jq,textStatus,errorThrown) {
				if(callbacks.error != undefined)
					callbacks.error(jq,textStatus,errorThrown);
			},
			success: function(data,textStatus,jq) {
				if(callbacks.success != undefined)
					callbacks.success(data);
			}
		});
		
	},
	/*
		Retrieve passwords for the passed domain
	*/
	this.checkIfPasswordsExist = function(Domain,callbacks) {
			
		$.ajax({
			type: "GET",
			data: {URL:Domain},
			url:this.getServerURL()+"?AJAX=true&action=check",
			beforeSend: function(jq,settings) {
				//add the headers for the auth:
				//returns false if there are no saved credentials
				//so return false to cancel the request
				if(!$MS.configureAuth(jq,settings,false))
				{
					//console.log("Check URL Request cancelled, no auth");
					return false
				}
				//console.log("Check URL Request  sent, auth available");
				if(callbacks.beforeSend != undefined)
					callbacks.beforeSend(jq,settings);
			},
			complete: function(jq,textStatus) {
			//console.log("Check URL Request  complete");
				if(callbacks.complete != undefined)
					callbacks.complete(jq,textStatus);
			},
			error: function(jq,textStatus,errorThrown) {
			//console.log("Check URL Request  errors");
				if(callbacks.error != undefined)
					callbacks.error(textStatus,errorThrown);
			},
			success: function(data,textStatus,jq) {
			//console.log("Check URL Request  success");
				if(callbacks.success != undefined)
					callbacks.success(data);
			}
		});
		
	},
	/*
		Retrieve passwords for the passed domain
	*/
	this.listURLS = function(callbacks) {
			
		$.ajax({
			type: "GET",
			url:this.getServerURL()+"?AJAX=true&action=list",
			beforeSend: function(jq,settings) {
				//add the headers for the auth:
				$MS.configureAuth(jq,settings,true);
				
				if(callbacks.beforeSend != undefined)
					callbacks.beforeSend(jq,settings);
			},
			complete: function(jq,textStatus) {
				if(callbacks.complete != undefined)
					callbacks.complete(jq,textStatus);
			},
			error: function(jq,textStatus,errorThrown) {
				if(callbacks.error != undefined)
					callbacks.error(jq,textStatus,errorThrown);
			},
			success: function(data,textStatus,jq) {
				if(callbacks.success != undefined)
					callbacks.success(data);
			}
		});
		
	},
	/**
		Performs the AJAX request saving the password
	*/
	this.setPassword = function(Domain,Credentials,rowSalt,force,callbacks) {

		$.ajax({
			type: "POST",
			data: {"URL":Domain,"Credentials":Credentials,"rowSalt":rowSalt,"force":force},
			url:this.getServerURL()+"?AJAX=true&action=save",
			beforeSend: function(jq,settings) {
				//add the headers for the auth:
				$MS.configureAuth(jq,settings,true);
				
				if(callbacks.beforeSend != undefined)
					callbacks.beforeSend(jq.settings);
			},
			complete: function(jq,textStatus) {
				if(callbacks.complete != undefined)
					callbacks.complete(jq,textStatus);
			},
			error: function(jq,textStatus,errorThrown) {
				if(callbacks.error != undefined)
					callbacks.error(jq,textStatus,errorThrown);
			},
			success: function(data,textStatus,jq) {
				if(callbacks.success != undefined)
					callbacks.success(data);
			}
		});
		
	},	
	/** removes the password with the request ID */
	
	this.removePasswords = function(ID,url,callbacks) {
		$.ajax({
			type: "DELETE",
			url:this.getServerURL()+"?AJAX=true&action=remove&ID="+ID,
			beforeSend: function(jq,settings) {
				//add the headers for the auth:
				$MS.configureAuth(jq,settings,true);
				
				if(callbacks.beforeSend != undefined)
					callbacks.beforeSend(jq,settings);
			},
			complete: function(jq,textStatus) {
				if(callbacks.complete != undefined)
					callbacks.complete(jq,textStatus);
			},
			error: function(jq,textStatus,errorThrown) {
				if(callbacks.error != undefined)
					callbacks.error(textStatus,errorThrown);
			},
			success: function(data,textStatus,jq) {
				if(callbacks.success != undefined)
					callbacks.success(data);
			}
		});
	},
	/**
		Performs the AJAX request renaming the URL with the ID passed
	*/
	this.renameURL = function(ID,newDomain,callbacks) {
	
		$.ajax({
			type: "PUT",
			data: {"ID":ID,"newURL":newDomain},
			url:this.getServerURL()+"?AJAX=true&action=rename",
			beforeSend: function(jq,settings) {
				//add the headers for the auth:
				$MS.configureAuth(jq,settings,true);
				
				if(callbacks.beforeSend != undefined)
					callbacks.beforeSend(jq,settings);
			},
			complete: function(jq,textStatus) {
				if(callbacks.complete != undefined)
					callbacks.complete(jq,textStatus);
			},
			error: function(jq,textStatus,errorThrown) {
				if(callbacks.error != undefined)
					callbacks.error(textStatus,errorThrown);
			},
			success: function(data,textStatus,jq) {
				if(callbacks.success != undefined)
					callbacks.success(data);
			}
		});
		
	},
	/** 
		Takes a jQuery AJAX object and does the voodoo to the headers for auth 
		last argument is whether to prompt or not
		
		Authorisation: MintSync1 Username+"|"+Nonce+"|"+ Base64EncodedAuthString
		base64EncodedAuthString = SHA512.b64(SHA512.hex(Password)+":"+Nonce)
		
	*/
	this.configureAuth = function(jqXHR,settings,prompt) {
		//AuthObject contains the username and SHA-512 of the password
		var AuthObject = this.getAuthenticationObject(prompt),
			shaObj,hash,
			authStr = "",
			nonce = this.generateRowSalt();
		
		if(AuthObject===null)
			return false;
		
		authStr	 = AuthObject.username+"|"+nonce+"|";
		hash = AuthObject.password;
		
		shaObj	 = new jsSHA(hash+":"+nonce,"ASCII");
		authStr	+= shaObj.getHash("SHA-512","B64");
		jqXHR.setRequestHeader("Authorization", "MintSync1 "+authStr);
		return true;
	},
	/**
		Asks the user for a password and returns a hash of it
	*/
	this.requestPassword = function(promptStr) {
		var 	password="",
				shaObj,
				hash;
		
		password=prompt(promptStr,"myverysecurepassword");
		shaObj = new jsSHA(password, "ASCII");
		hash  = shaObj.getHash("SHA-512", "HEX");
				
		return hash;
	},	
	/**
		Returns a string type that contains a hex representation of 
			the password hash (SHA-512), this is the MASTER Key
			
			This *should* be salted really, however the salt would have to be saved
				could this be saved server-side?
	*/
	this.getEncryptionPasswordHash = function() {
		//text to appear on the password prompt
		var strPrompt = "Enter your crypto password";
		
		if(widget.preferences["SavePassword"]==1)
		{
			if(!widget.preferences["SavedPassword"] || widget.preferences["SavedPassword"]==="undefined")
				widget.preferences["SavedPassword"] = this.requestPassword(strPrompt);
				
			return widget.preferences["SavedPassword"];
		}
		else if (widget.preferences["SavePassword"]==0.8)
		{
			var passwd;
			//get the password from the background process
			passwd = opera.extension.bgProcess.mintSyncGlobals.passwd;
			if(passwd==undefined)
			{
				passwd = this.requestPassword(strPrompt);
				//set the password in the background process
				opera.extension.bgProcess.mintSyncGlobals.passwd = passwd;
			}
			
			return passwd;
				
		}
		else if (widget.preferences["SavePassword"]==0.5)
		{
			//request password and store in global
			if(this.rememberedPassword==undefined)
				this.rememberedPassword = this.requestPassword(strPrompt);
			
			return this.rememberedPassword;
		}
		else {
				return this.requestPassword(strPrompt);
		}
	},
	/**
		Will retrieve the authentication credentials if saved and request for them if not
	*/
	this.getAuthenticationObject = function(prompt) {
		
		if(widget.preferences["SaveAuthentication"]==1)
		{
			if((!widget.preferences["SavedAuthentication"] || widget.preferences["SavedAuthentication"]==="undefined") && prompt)
				widget.preferences["SavedAuthentication"] = JSON.stringify(this.requestAuthenticationDetails());
				
			return $.parseJSON(widget.preferences["SavedAuthentication"]);
		}
		else if (widget.preferences["SaveAuthentication"]==0.8)
		{
			var authentication;
			//if the bgProcess doesn't exist then we're calling FROM the background process
			if(opera.extension.bgProcess == undefined)
			{
				//we're in the background process so grab it from the global
				authentication = mintSyncGlobals.authentication;
				
				if(authentication==undefined)	//we can't popup so return null
				{
					return null;
				}
			}
			else
			{
				//get the password from the background process
				authentication = opera.extension.bgProcess.mintSyncGlobals.authentication;
				
				if(authentication==undefined && prompt)
				{
					authentication = this.requestAuthenticationDetails();
					//set the password in the background process
					opera.extension.bgProcess.mintSyncGlobals.authentication = authentication;
				}
			}

			return authentication;
				
		}
		else if (widget.preferences["SaveAuthentication"]==0.5)
		{
			//request password and store in global
			if(this.rememberedAuthentication==undefined && prompt)
				this.rememberedAuthentication = this.requestAuthenticationDetails();
			
			return this.rememberedAuthentication;
		}
		else if(prompt)
		{
				return this.requestAuthenticationDetails();
		}
		else {
			return null;
		}
		
	}
	
	/** 
		Requests from the user their authentication information
	**/
	this.requestAuthenticationDetails = function() {
		var authInfo = new Object,
			shaObj, hash;
		
		while(!(authInfo.username = prompt("Username:"))){};
		while(!(authInfo.password = prompt("Password:"))){};
		
		shaObj = new jsSHA(authInfo.password, "ASCII");
		authInfo.password  = shaObj.getHash("SHA-512", "HEX");
		
		return authInfo;
	},
	/** 
		Returns whether or not a password should be automatically 
		retrieved when the pop up is launched or not.
	**/
	this.getAutoFetch = function(){
		return widget.preferences["AutoFetch"];
	},
	/** 
		Returns whether or not the user wants to be notified when 
		there is a password on the page or not
	**/
	this.getNotify = function(){
		return widget.preferences["Notify"]=="1";
	},
	/**
		Get the Server's base URL
	*/
	this.getServerURL = function(){
		return widget.preferences["ServerURL"];
	},
	/**
		Returns the password length configured
	*/
	this.getGeneratedPasswordLength = function(){
		return widget.preferences["GeneratedPasswordLength"];
	},
	/**
		Returns the length the row salt should be generated to
	*/
	this.getGeneratedRowSaltLength = function(){
		return 32;
	}
	/**
	Generates a random salt string
	*/
	this.generateRowSalt = function() {
		//	return "6";		//chosen by random dice roll, guaranteed to be random
		//| is not in this sourceSet because its used as a delimiter for the auth
		var sourceSet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`~!@#$%^&*()-_=+[{]}\\;:'\",<.>/?",
			length = this.getGeneratedRowSaltLength(), 
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
			sourceString="";
		
		//build	sourceString from preferences
		sourceString = sourceSet.alpha;
		
		sourceString += widget.preferences["passwordStrengthNum"]	 == "true"	?sourceSet.num:"";
		sourceString += widget.preferences["passwordStrengthPunc1"] == "true"	?sourceSet.punc1:"";
		sourceString += widget.preferences["passwordStrengthPunc2"] == "true"	?sourceSet.punc2:"";
		
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
