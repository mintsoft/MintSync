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
	this.decodeAndDecrypt = function(encryptedObject,rowSalt,mc_callbacks){
		var 	base64decoded = base64_decode(encryptedObject),
				key = "", 
				decryptedJSON = "", 
				credentialsObj = new Object();
				
		$MS.getEncryptionPasswordHash(function(passwordHash){
			key = passwordHash+""+rowSalt;
			decryptedJSON = $MC.Decrypt_strings(base64decoded,key,"AES",256);
			try 
			{
				credentialsObj = $.parseJSON(decryptedJSON);	
				mc_callbacks.success(credentialsObj);
			}
			catch(err)
			{
				//parse error, incorrect password
				mc_callbacks.error();
			}
		});
	},
	/**
		Takes an object and a salt, JSONs the objected, encrypts it then BASE64 and returns the string
	*/
	this.encodeAndEncrypt = function(srcObject,RowSalt,mc_callback){
		//Generate JSON String
		var Credentials = JSON.stringify(srcObject);
		
		$MS.getEncryptionPasswordHash(function(passwordHash){
			encryptionKey = passwordHash+""+RowSalt,
			encryptedData = base64_encode($MC.Encrypt_strings(Credentials,encryptionKey,"AES",256));
			mc_callback(encryptedData,$MS.hashPass(passwordHash));
		});
	}
}

$MC=new MintCrypto();