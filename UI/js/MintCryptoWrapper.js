/**
	Wrapper Class for Crypto Libraries,
**/

function MintCrypto() {
	var self = this;
	this.Decrypt_strings = function(cipherText,keyText,Cipher,keySize,iv){
		switch(Cipher.toUpperCase()){
			case "AESRAW_OFB":
				return aes_raw_cfb_decrypt(cipherText,keyText,keySize,iv);
			case "AESRAW":
				return Aes.Ctr.decryptWithRawKey(cipherText,keyText);
			default:
				return Aes.Ctr.decrypt(cipherText, keyText, keySize);
		}

	};

	this.Encrypt_strings = function(cipherText,keyText,Cipher,keySize,iv){
		switch(Cipher.toUpperCase()){
			case "AESRAW_OFB":
				return aes_raw_cfb_encrypt(cipherText,keyText,keySize,iv);
			case "AESRAW":
				return Aes.Ctr.encryptWithRawKey(cipherText,keyText);
			default:
				return Aes.Ctr.encrypt(cipherText, keyText, keySize);
		}
	};

	function cryptoSchemeString(cryptoScheme) {
		switch (1 * cryptoScheme) {
			case 1:
				return "AESRAW";
				break;
			case 2:
				return "AESRAW_OFB";
				break;
			default:
				return "AES";
		}
	}
	function aes_raw_cfb_decrypt(clearText, keyText, keySize, iv)
	{
		var clearBytes = cryptoHelpers.convertStringToByteArray(clearText);
		var keyBytes = cryptoHelpers.convertStringToByteArray(keyText);
		return slowAES.decrypt(clearBytes, slowAES.OFB, keyBytes, iv);
	}
	function aes_raw_cfb_encrypt(cipherText, keyText, keySize, iv)
	{
		var cipherBytes = cryptoHelpers.convertStringToByteArray(cipherText);
		var keyBytes = cryptoHelpers.convertStringToByteArray(keyText);
		return slowAES.encrypt(cipherBytes, slowAES.OFB, keyBytes, iv);
	}
	function generateIV(inputString)
	{
		var shaObj = new jsSHA(inputString, "ASCII");
		var iv = self.Hex2Array(shaObj.getHash("SHA-256","HEX"));
		iv = iv.slice(0,128/8);
		return iv;
	}
	/**
		Takes an base64encoded & encrypted JSON object and returns the decrypted object
	*/
	this.decodeAndDecrypt = function(encryptedObject, rowSalt, keySlot, cryptoScheme, mc_callbacks){
		var		base64decoded = base64_decode(encryptedObject),
				decryptedJSON = "",
				credentialsObj = {};

		$MS.getEncryptionPasswordHash(function(passwordHash){
			self.handleDecodeAndDecrypt(passwordHash, rowSalt, keySlot, base64decoded, cryptoScheme, mc_callbacks, 0);
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
	this.handleDecodeAndDecrypt = function(passwordHash, rowSalt, keySlot, base64decoded, cryptoScheme, mc_callbacks, callbackCount){
		//Unlock the KeySlot with SHA-256 of the passwordHash to form half of the
		//row encryption key
		shaObj		= new jsSHA(passwordHash,"ASCII");
		keySlotKey	= self.Hex2Str(shaObj.getHash("SHA-256","HEX"));
		cryptoCypher = cryptoSchemeString(cryptoScheme);

		var iv = generateIV(keySlot);
		//keySlot is stored BASE64 but it will be base64_decoded by the AES Library
		rawKey = self.Decrypt_strings(keySlot, keySlotKey, cryptoCypher, 256, iv) + "" + rowSalt;

		//SHA-256 the KeySlot+rowSalt to form the row decryption key
		shaObj	= new jsSHA(rawKey,"ASCII");
		key		= self.Hex2Str(shaObj.getHash("SHA-256","HEX"));

		iv = generateIV(rowSalt);
		decryptedJSON = self.Decrypt_strings(base64decoded, key, cryptoCypher, 256, iv);
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
					self.handleDecodeAndDecrypt(newPasswordHash, rowSalt, keySlot, base64decoded, cryptoScheme, mc_callbacks, ++callbackCount);
				});
			else	//error callback triggered if failed request 5 times
				mc_callbacks.error();
		}
	};

	/**
		Takes an object and a salt, JSONs the objected, encrypts it then BASE64 and returns the string
	*/
	this.encodeAndEncrypt = function(srcObject,rowSalt,keySlot,cryptoScheme,mc_callback){
		//Generate JSON String
		var Credentials = JSON.stringify(srcObject);
		$MS.getEncryptionPasswordHash(function(passwordHash){

			var cypher = cryptoSchemeString(cryptoScheme);
			//Unlock the KeySlot with SHA-256 of the passwordHash to form half of the
			//row encryption key
			shaObj		= new jsSHA(passwordHash,"ASCII");
			keySlotKey	= self.Hex2Str(shaObj.getHash("SHA-256","HEX"));

			var iv = generateIV(keySlot);
			//keySlot is stored BASE64 but it will be base64_decoded by the AES Library
			rawKey = self.Decrypt_strings(keySlot,keySlotKey,cypher,256,iv)+""+rowSalt;

			var iv = generateIV(rowSalt);
			//SHA-256 the KeySlot+rowSalt to form the row decryption key
			shaObj			= new jsSHA(rawKey,"ASCII");
			encryptionKey	= self.Hex2Str(shaObj.getHash("SHA-256","HEX"));
			
			encryptedData = base64_encode(self.Encrypt_strings(Credentials,encryptionKey,cypher,256, iv));
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
			str += self.dec2hexChar(c) + '';
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
			str += self.dec2hexChar(array[i]) + '';
		}
		return str;
	};
}

var $MC = new MintCrypto();