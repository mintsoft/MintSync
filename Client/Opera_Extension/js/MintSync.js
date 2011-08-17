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
	this.setPassword = function(Domain,Credentials,rowSalt) {
	
		//$("#preoutputSave").text("Sent To Webserver:\n"+"Domain: '" +Domain+"'\nCredentials: '"+Credentials+"'\nRowSalt: '"+rowSalt+"'");
	
		$.ajax({
			type: "POST",
			data: {URL:Domain,Credentials:Credentials,rowSalt:rowSalt},
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
	}	
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
	}
};
$MS = new MintSync();

/** Global Function Handlers **/
function getPasswords(domainName) {
	$MS.getPasswords(domainName, function(data){
		var outputStr = "",
			decryptedJSON = "",
			key = "",
			base64decoded="";
		
//		outputStr = "Received From Webserver:\n"+data+"\n\n";
		
		parsedObject = $.parseJSON(data);
		switch(parsedObject.status)
		{
			case "ok":
			
				base64decoded = base64_decode(parsedObject.data.Credentials);
				passwordHash = $MS.getPasswordHash();
			
				key = passwordHash+""+parsedObject.data.Salt;

				decryptedJSON = $MC.Decrypt_strings(base64decoded,key,"AES",256);
				
				outputStr+= "Decrypted Credentials:\n"+decryptedJSON+"\n";
				
			break;
			case "not-found":
			
				outputStr = "URL not found.";
				
			break;
			case "failed":
			
				outputStr = "Error, Retrieval Failed.";
				
			break;
			default:
			
		}
		$('#preoutput').text(outputStr);
	});
}

/**
	
*/
function setPassword() {
	var domainName=$("#domainName").val(),
		Credentials = $("#inputPassword").val(),
		RowSalt = $MS.generateRowSalt(),
		encryptedData = "",
		encryptionKey = "",
		passwordHash = $MS.getPasswordHash();
	
	encryptionKey = passwordHash+""+RowSalt;
	
	encryptedData = base64_encode($MC.Encrypt_strings(Credentials,encryptionKey,"AES",256));
	
	$MS.setPassword(domainName,encryptedData,RowSalt);
}