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
	this.getPasswords = function(Domain, callback) {
			
		$.ajax({
			type: "POST",
			data: {URL:Domain},
			url:this.getServerURL()+"?action=retrieve",
			beforeSend: function(jq,settings) {
				$("#fetchDiv").hide(0);
				$("#loadingDiv").show(0);
			},
			complete: function(jq,textStatus) {
				$("#loadingDiv").hide(0);
				$("#fetchDiv").show(0);
			},
			error: function(jq,textStatus,errorThrown) {
				alert("An Error Occurred:" + textStatus + "\n" + errorThrown);
			},
			success: function(data,textStatus,jq) {
				callback(data);
			}
		});
		
	},
	/**
		Performs the AJAX request saving the password
	*/
	this.setPassword = function(Domain,Credentials,rowSalt,force) {
	
		//$("#preoutputSave").text("Sent To Webserver:\n"+"Domain: '" +Domain+"'\nCredentials: '"+Credentials+"'\nRowSalt: '"+rowSalt+"'");
	
		$.ajax({
			type: "POST",
			data: {"URL":Domain,"Credentials":Credentials,"rowSalt":rowSalt,"force":force},
			url:this.getServerURL()+"?action=save",
			beforeSend: function(jq,settings) {
			},
			complete: function(jq,textStatus) {
			},
			error: function(jq,textStatus,errorThrown) {
				alert("An Error Occurred:" + textStatus + "\n" + errorThrown);
			},
			success: function(data,textStatus,jq) {
				$("#preoutputSave").text($("#preoutputSave").text()+"\nWebserver Returned:"+data);
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
			the password hash (SHA-512);
			
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
							"punc2"	: "`~!@$%^&*()_+{}|:\"<>?",
						 },
			password="",
			sourceString="";
		
		//TODO: build	sourceString from preferences here
		sourceString = sourceSet.num+""+sourceSet.alpha+""+sourceSet.punc1+""+sourceSet.punc2;
		
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
