module("AES CTR");

test( "Given a correct text, keys of the correct length and the correct keySize", function() {
	
	var clearText = "This is a very, VERY secure string that should be supa encrypted";
	var keyText = "012345678901234567890123459678912";
	var keySize = 256;
	
	var encrypted = Aes.Ctr.encrypt(clearText, keyText, keySize);
	var decrypted = Aes.Ctr.decrypt(encrypted, keyText, keySize);
	
	equal(
		clearText, decrypted, "text can be encrypted and decrypted!"
	);
});

test( "Given text and two differing keys the output cannot be decrypted", function() {
	
	var clearText = "This is a very, VERY secure string that should be supa encrypted";
	var encryptKeyText = "012345678901234567890123459678912";
	var decryptKeyText = "01234567890123456789";
	var keySize = 256;
	
	var encrypted = Aes.Ctr.encrypt(clearText, encryptKeyText, keySize);
	var decrypted = Aes.Ctr.decrypt(encrypted, decryptKeyText, keySize);
	
	notEqual(
		clearText, decrypted, "text cannot be decrypted with a different key"
	);
});

test( "Given a hashed password show that full hash is required to decrypt the data", function() {
	var keySize = 256;
	var shaObj = new jsSHA("passwordHash","ASCII");
	var encryptKeyText	= $MC.Hex2Str(shaObj.getHash("SHA-256","HEX"));
	var decryptKeyText = encryptKeyText.substring(0,encryptKeyText.length-8);
	var clearText = "This is a very, VERY secure string that should be supa encrypted";
	
	notEqual(encryptKeyText, decryptKeyText, "encrypt and decrypt keys should not be identical")
	
	var encrypted = Aes.Ctr.encrypt(clearText, encryptKeyText, keySize);
	var decrypted = Aes.Ctr.decrypt(encrypted, decryptKeyText, keySize);
	
	notEqual(
		clearText, decrypted, "decrypted should not be equal to clearText"
	);
});