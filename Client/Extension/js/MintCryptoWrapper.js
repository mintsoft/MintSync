/**
	Wrapper Class for Crypto Libraries,
**/

function MintCrypto() {
	this.Decrypt_strings = function(cipherText,keyText,Cipher,keySize){
		switch(Cipher.toUpperCase()){
//			case "AES":
			default:
				return Aes.Ctr.decrypt(cipherText, keyText, keySize);
		}
	
	};

	this.Encrypt_strings = function(cipherText,keyText,Cipher,keySize){
		switch(Cipher.toUpperCase()){
//			case "AES":
			default:
				return Aes.Ctr.encrypt(cipherText, keyText, keySize);
		}
	};
	/** 
		Takes an base64encoded & encrypted JSON object and returns the decrypted object
	*/
	this.decodeAndDecrypt = function(encryptedObject, rowSalt, keySlot, mc_callbacks){
		var		base64decoded = base64_decode(encryptedObject),
				decryptedJSON = "", 
				credentialsObj = {};
				
		$MS.getEncryptionPasswordHash(function(passwordHash){
			$MC.handleDecodeAndDecrypt(passwordHash, rowSalt, keySlot, base64decoded, mc_callbacks, 0);
		});
	};
	/** 
		callback used for  decodeAndDecrypt,
		refactored into a standalone function for recursion
		
		@param passwordHash SHA-512 of the master password
		@param rowSalt	Randomly generated row-specific encryption salt
		@param keySlot  The encrypted KeySlot to be used to decrypt the password
		@param mc_callbacks an object containing jQuery AJAX callback functions
		@param callbackCount the number of times the callback has been executed
	**/
	this.handleDecodeAndDecrypt = function(passwordHash, rowSalt, keySlot, base64decoded, mc_callbacks, callbackCount){
		//Unlock the KeySlot with SHA-256 of the passwordHash to form half of the
		//row encryption key
		shaObj		= new jsSHA(passwordHash,"ASCII");
		keySlotKey	= $MC.Hex2Str(shaObj.getHash("SHA-256","HEX"));
		
		//keySlot is stored BASE64 but it will be base64_decoded by the AES Library
		rawKey = $MC.Decrypt_strings(keySlot,keySlotKey,"AES",256)+""+rowSalt;
		
		//SHA-256 the KeySlot+rowSalt to form the row decryption key
		shaObj	= new jsSHA(rawKey,"ASCII");
		key		= $MC.Hex2Str(shaObj.getHash("SHA-256","HEX"));
		
		decryptedJSON = $MC.Decrypt_strings(base64decoded,key,"AES",256);
		try 
		{
			credentialsObj = $.parseJSON(decryptedJSON);	
			mc_callbacks.success(credentialsObj);
		}
		catch(err)
		{
			$MS.resetSavedCryptoPassword();
			//parse error, incorrect password
			if(callbackCount<5)
				$MS.getEncryptionPasswordHash(function(newPasswordHash){
					$MC.handleDecodeAndDecrypt(newPasswordHash, rowSalt, keySlot, base64decoded, mc_callbacks, ++callbackCount);
				});
			else	//error callback triggered if failed request 5 times
				mc_callbacks.error();
		}
	};
	
	/**
		Takes an object and a salt, JSONs the objected, encrypts it then BASE64 and returns the string
	*/
	this.encodeAndEncrypt = function(srcObject,rowSalt,keySlot,mc_callback){
		//Generate JSON String
		var Credentials = JSON.stringify(srcObject);
		$MS.getEncryptionPasswordHash(function(passwordHash){
			
			//Unlock the KeySlot with SHA-256 of the passwordHash to form half of the
			//row encryption key
			shaObj		= new jsSHA(passwordHash,"ASCII");
			keySlotKey	= $MC.Hex2Str(shaObj.getHash("SHA-256","HEX"));
			
			//keySlot is stored BASE64 but it will be base64_decoded by the AES Library
			rawKey = $MC.Decrypt_strings(keySlot,keySlotKey,"AES",256)+""+rowSalt;

			//SHA-256 the KeySlot+rowSalt to form the row decryption key
			shaObj			= new jsSHA(rawKey,"ASCII");
			encryptionKey	= $MC.Hex2Str(shaObj.getHash("SHA-256","HEX"));
			
			encryptedData = base64_encode($MC.Encrypt_strings(Credentials,encryptionKey,"AES",256));
			mc_callback(encryptedData,$MS.hashPass(passwordHash));
		});
	};
	/** Hex to String and viceVersa functions
	
		Borrowed from: http://www.webdeveloper.com/forum/showthread.php?t=204165
		then completely changed to make it work
	*/
	this.dec2hexChar = function(d){
		return (d<16 ? "0" : "") + d.toString(16);
	};
	this.hex2decChar = function(h){
		return parseInt(h,16);
	};
	this.Str2Hex = function (srcStr){
		var str = '';
		for (var i=0; i<srcStr.length; i++) 
		{
			c = srcStr.charCodeAt(i);
			str += $MC.dec2hexChar(c) + '';
		}
		return str;
	};
	this.Hex2Str = function (srcStr){
		var str = '';
		for (var i=0; i<srcStr.length; i+=2) 
		{
			c = String.fromCharCode(this.hex2decChar(srcStr[i]+""+srcStr[i+1]));
			str += c;
		}
		return str;
	};
	this.Hex2Array = function(srcStr){
		var bytes = [];
		for(var i=0; i<srcStr.length; i+=2)
		{
			bytes.push(this.hex2decChar(srcStr[i]+""+srcStr[i+1]));
		}
		return bytes;
	};
	this.Array2Hex = function(array){
		var str = "";
		for(var i=0; i<array.length; i++)
		{
			str += $MC.dec2hexChar(array[i]) + '';
		}
		return str;
	};
}

var $MC = new MintCrypto();