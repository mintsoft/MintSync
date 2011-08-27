/**
	Wrapper Class for Crypto Libraries,
**/

function MintCrypto() {
	this.Decrypt_strings = function(cipherText,keyText,Cipher,keySize){
		switch(Cipher.toUpperCase()){
			case "AES":
			default:
				return Aes.Ctr.decrypt(cipherText, keyText, keySize);
		}
	
	},

	this.Encrypt_strings = function(cipherText,keyText,Cipher,keySize){
		switch(Cipher.toUpperCase()){
			case "AES":
			default:
				return Aes.Ctr.encrypt(cipherText, keyText, keySize);
		}
	},
	/** 
		Takes an base64encoded & encrypted JSON object and returns the decrypted object
	*/
	this.decodeAndDecrypt = function(encryptedObject){
		var 	base64decoded = base64_decode(encryptedObject),
				passwordHash = "", 
				key = "", 
				decryptedJSON = "", 
				credentialsObj = new Object();
				
		passwordHash = $MS.getPasswordHash()
		key = passwordHash+""+parsedObject.data.Salt;
		decryptedJSON = $MC.Decrypt_strings(base64decoded,key,"AES",256);
		credentialsObj = $.parseJSON(decryptedJSON);
		
		return credentialsObj;
	},
	/**
		Takes an object and a salt, JSONs the objected, encrypts it then BASE64 and returns the string
	*/
	this.encodeAndEncrypt = function(srcObject,RowSalt){
		//Generate JSON String
		
		var Credentials = JSON.stringify(srcObject),
			passwordHash = $MS.getPasswordHash(),
			encryptionKey = passwordHash+""+RowSalt,
			encryptedData = base64_encode($MC.Encrypt_strings(Credentials,encryptionKey,"AES",256));
		
		return encryptedData;
	}
}

$MC=new MintCrypto();