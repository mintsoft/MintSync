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
	}
}

$MC=new MintCrypto();