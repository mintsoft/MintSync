//required otherwise jQuery attempts to stop the cross domain request
jQuery.support.cors = true;

/** 
	MintSync Object
*/
function MintSync() {
	/*
		Get the Server's base URL
	*/
	this.getServerURL = function(){
		return widget.preferences["ServerURL"];
	}
	/*
		Retrieve passwords for the passed domain
	*/
	this.getPasswords = function(Domain, callbacks) {
			
		$.ajax({
			type: "POST",
			data: {URL:Domain},
			url:this.getServerURL()+"?AJAX=true&action=retrieve",
			beforeSend: function(jq,settings) {
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
	/*
		Retrieve passwords for the passed domain
	*/
	this.checkIfPasswordsExist = function(Domain,callbacks) {
			
		$.ajax({
			type: "POST",
			data: {URL:Domain},
			url:this.getServerURL()+"?AJAX=true&action=check",
			beforeSend: function(jq,settings) {
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
	/*
		Retrieve passwords for the passed domain
	*/
	this.listURLS = function(callbacks) {
			
		$.ajax({
			type: "POST",
			url:this.getServerURL()+"?AJAX=true&action=list",
			beforeSend: function(jq,settings) {
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
		Performs the AJAX request saving the password
	*/
	this.setPassword = function(Domain,Credentials,rowSalt,force,callbacks) {
	
		//$("#preoutputSave").text("Sent To Webserver:\n"+"Domain: '" +Domain+"'\nCredentials: '"+Credentials+"'\nRowSalt: '"+rowSalt+"'");
	
		$.ajax({
			type: "POST",
			data: {"URL":Domain,"Credentials":Credentials,"rowSalt":rowSalt,"force":force},
			url:this.getServerURL()+"?AJAX=true&action=save",
			beforeSend: function(jq,settings) {
				if(callbacks.beforeSend != undefined)
					callbacks.beforeSend(jq.settings);
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
	/** removes the password with the request ID */
	
	this.removePasswords = function(ID,url,callbacks) {
		$.ajax({
			type: "POST",
			data: {"ID":ID,"URL":url},
			url:this.getServerURL()+"?AJAX=true&action=remove",
			beforeSend: function(jq,settings) {
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
			type: "POST",
			data: {"ID":ID,"newURL":newDomain},
			url:this.getServerURL()+"?AJAX=true&action=rename",
			beforeSend: function(jq,settings) {
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
		Asks the user for the password and returns a hash of it
	*/
	this.requestPassword = function() {
		var 	password="",
				shaObj,// = new jsSHA(, "ASCII"),
				hash;// = shaObj.getHash("SHA-512", "HEX");
		
		password=prompt("Enter Your Password","myverysecurepassword");
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
	this.getPasswordHash = function() {
		
		if(widget.preferences["SavePassword"]==1)
		{
			if(!widget.preferences["SavedPassword"])
				widget.preferences["SavedPassword"] = this.requestPassword();
				
			return widget.preferences["SavedPassword"];
		}
		else if (widget.preferences["SavePassword"]==0.8)
		{
			var passwd;
			//get the password from the background process
			passwd = opera.extension.bgProcess.mintSyncGlobals.passwd;
			if(passwd==undefined)
			{
				passwd = this.requestPassword();
				//set the password in the background process
				opera.extension.bgProcess.mintSyncGlobals.passwd = passwd;
			}
			
			return passwd;
				
		}
		else if (widget.preferences["SavePassword"]==0.5)
		{
			//request password and store in global
			if(this.rememberedPassword==undefined)
				this.rememberedPassword = this.requestPassword();
			
			return this.rememberedPassword;
		}
		else {
				return this.requestPassword();
		}
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
	Generates a random salt string
	*/
	this.generateRowSalt = 	function() {
		//	return "6";		//chosen by random dice roll, guaranteed to be random
		var sourceSet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`~!@#$%^&*()-_=+[{]}\\|;:'\",<.>/?",
			length = 32, 
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
		
		sourceString += widget.preferences["passwordStrengthNum"]=="true"	?sourceSet.num:"";
		sourceString += widget.preferences["passwordStrengthPunc1"]=="true"	?sourceSet.punc1:"";
		sourceString += widget.preferences["passwordStrengthPunc2"]=="true"	?sourceSet.punc2:"";
		
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
