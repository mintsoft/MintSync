/**	
	Wrapper for rijndaelDecrpt that automagically takes input arguments as strings
	
	This will take a SHA-256 of the keyText and use that for the encryption

*/
function Decrypt_strings(cipherText,keyText,Cipher,keySize){
	return Aes.Ctr.decrypt(cipherText, keyText, 256);
}

/**	
	Wrapper for rijndaelEncrypt that automagically takes input arguments as strings
	
	This will take a SHA-256 of the keyText and use that for the encryption
*/
function Encrypt_strings(cipherText,keyText,Cipher,keySize){
	return Aes.Ctr.encrypt(cipherText, keyText, 256);
}