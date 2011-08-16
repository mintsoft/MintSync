
/** 
	MintSync Object
*/
function MintSync() {
	this.server_base_URL = "https://set.mintsoft.net/code/MintSync/Server/",
	
	/*
		Retrieve passwords for the passed domain
	*/
	this.getPasswords = function(Domain, callback) {
			
		$.ajax({
			type: "POST",
			data: {URL:Domain},
			url:this.server_base_URL+"?action=retrieve",
			beforeSend: function(jq,settings) {
			},
			complete: function(jq,textStatus) {
			},
			error: function(jq,textStatus,errorThrown) {
				alert("An Error Occurred:" + textStatus + "\n" + errorThrown);
			},
			success: function(data,textStatus,jq) {
				callback(data);
			}
		});
		
	},
	this.setPassword = function(Domain,Credentials,rowSalt) {
	
		$("#preoutputSave").text("Sent To Webserver:\n"+"Domain: '" +Domain+"'\nCredentials: '"+Credentials+"'\nRowSalt: '"+rowSalt+"'");
	
		$.ajax({
			type: "POST",
			data: {URL:Domain,Credentials:Credentials,rowSalt:rowSalt},
			url:this.server_base_URL+"?action=save",
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
		Returns a string type that contains a hex representation of 
			the password hash (SHA-512);
			
		//TODO: implement this
	*/
	this.getPasswordHash = function() {
		
		var 	shaObj = new jsSHA("myverysecurepassword", "ASCII"),
				hash = shaObj.getHash("SHA-512", "HEX");
				
		return hash;
		
	}
};
$MS = new MintSync();

/** Global Function Handlers **/
function getPasswords(form) {
	var domainName = $("#domainInput").val();
	$MS.getPasswords(domainName, function(data){
		var outputStr = "",
			decryptedJSON = "",
			key = "",
			base64decoded="";
		
		outputStr = "Received From Webserver:\n"+data+"\n";
		
		parsedObject = $.parseJSON(data);
		base64decoded = base64_decode(parsedObject.Credentials);
		passwordHash = $MS.getPasswordHash();
		
		key = passwordHash+""+parsedObject.Salt;

		decryptedJSON = $MC.Decrypt_strings(base64decoded,key,"AES",256);
		
			outputStr+= "\n\nDecrypted Credentials:\n"+decryptedJSON+"\n";
		$('#preoutput').text(outputStr);
		
	});
}

/**
	Generates a random salt string
	
	//TODO: implement this
*/
function generateRowSalt() {
	return "6";		//chosen by random dice roll, guaranteed to be random
}

/**
	
*/
function setPassword() {
	var domainName=$("#domainName").val(),
		Credentials = $("#inputPassword").val(),
		RowSalt = generateRowSalt(),
		encryptedData = "",
		encryptionKey = "",
		passwordHash = $MS.getPasswordHash();
	
	encryptionKey = passwordHash+""+RowSalt;
	
	encryptedData = base64_encode($MC.Encrypt_strings(Credentials,encryptionKey,"AES",256));
	
	$MS.setPassword(domainName,encryptedData,RowSalt);
}