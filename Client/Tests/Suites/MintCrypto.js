module("MintCryptoWrapper -> Core");

var cypher = "AES", keySize = 256;

test( "Given known CypherText and keys, Decrypt_strings returns known plaintext", function() {
	equal(
		$MC.Decrypt_strings("", "", cypher, keySize),
		"",
		"Empty String input and empty key returns empty string"
	);
	
	equal(
		$MC.Decrypt_strings("NABcxIUvnlLoYmGkvD1HIB1+X7xymU9FnWyUNU94jz2tEA==", "ThisIsMyKey", cypher, keySize),
		"OMG this is my supa secret",
		"Can decrypt a string with a simple key"
	);
});

//Note, $MC.Encrypt_strings is untestable by itself as it uses a random CTR
test( "Given a plaintext it can be encrypted and decrypted again", function() {
	var cryptoKey = "ThisIsMyKey", inputStr = "OMG this is my supa secret";
	
	var cypherText = $MC.Encrypt_strings(inputStr, cryptoKey, cypher, keySize);
	
	equal(
		$MC.Decrypt_strings(cypherText, cryptoKey, cypher, keySize),
		inputStr,
		"Can both encrypt and decrypt a string with the same key"
	);
});

test( "Given the set of keySlotPassword, rowSalt, keySlot and the encrypted credentials object a valid plaintext JSON credentials object is decrypted", 1, function() {
	var masterPasswordHash = "1b0461d726e1593a8e7bcb30726c10a89f672f0428726ac1369abb5f1a8a5319892889774d2ed2c760b9b86b4666786590c54636696afdce97416cd7d3bccc88",
		rowSalt = "2Xpe`UA8{+L?O4TcnCH\\+$Vt&<c'TqE6",	//TWO backslashes 
		keySlot = "ugIyituTtFEoX3EJ459HRM+15SfgzVjomIb3Bb6jJ8TaOW74CW3tchto4erEg223sCd1YebbcaHIsLM819DnJ1V82a5yHtlkPtVUU8yLoYSCmwSKgoELGRYu3cX4DOes/5KmHaNYMz2qCyiF",
		base64decoded = "TQKgsE6UtFHRxYY0UITlQn1Q4F0O6VE+cLCJ+xSSpZbbxTG+AbH2C6sGZdQyQjlr5iz4Grct/EhREoRm8I51NHwmiqkcEalb2pqfBpalPk9+E5+eoQgOp59FcNAXSPKuNQRS8y4kUJ6ksJ8OHhyCSKz19144QrfDb0/aC8QJuw==",
		callbackCount = 0,
		cryptoScheme = 0,
		mc_callbacks = {
			success: function(credentialsObject) {
				deepEqual(credentialsObject, 
					{
					  "Password": "_zZD<lxcmo0/|cNC",
					  "Username": "d`e))hG4y2z`aB/A",
					  "lkjkljklj": "u9,;/Ws<Qi%^Zbxu",
					  "meila": "O_H-CdOw-UT84^OA"
					}
				);
			}
		};	
	$MC.handleDecodeAndDecrypt(masterPasswordHash, rowSalt, keySlot, base64decoded, cryptoScheme, mc_callbacks, callbackCount);
});

/*
// This is difficult to test without mocking $MS and it just wraps handleDecodeAndDecrypt anyway
test( "Given encryptedObject and RowSalt; callbacks are fired?", function() {	//todo make less bs
	$MC.decodeAndDecrypt(encryptedObject, rowSalt, keySlot, mc_callbacks);
});
*/

test( "Given a credentials object, rowSalt and keySlot does encodeAndEncrypt encrypt into a decryptable form?", 2, function() {
	var srcObject = {
			"username"	: "robtest",
			"password"	: "mypassword",
			"email"		: "robtest@example.com"
		},
		cryptoScheme = 0,
		rowSalt = ".Uip*M5V~rWMD(oY",
		keySlot = "ugIyituTtFEoX3EJ459HRM+15SfgzVjomIb3Bb6jJ8TaOW74CW3tchto4erEg223sCd1YebbcaHIsLM819DnJ1V82a5yHtlkPtVUU8yLoYSCmwSKgoELGRYu3cX4DOes/5KmHaNYMz2qCyiF",
		mc_callback = function(encryptedData, cryptoHash) {
			deepEqual(cryptoHash, "f2e16cd0df86a558bfd6228b40384d3cd85306c5d828b5f50b930ec1858f98fa5253a58a541328afe82e16d8a63a98d5cd14080b6e5269bba100f584e2476059");
			
			//for reasons passing understanding, the output of encodeAndEncrypt is double base64 encoded, yet handleDecodeAndDecrypt only wants it single encoded
			//TODO: sort this out!
			base64decoded = base64_decode(encryptedData);
			//now check that the encryptedData can be decrypted into the original object (copied from the above test basically)
			$MC.handleDecodeAndDecrypt("1b0461d726e1593a8e7bcb30726c10a89f672f0428726ac1369abb5f1a8a5319892889774d2ed2c760b9b86b4666786590c54636696afdce97416cd7d3bccc88",
				rowSalt,
				keySlot,
				base64decoded,
				cryptoScheme,
				{
					success: function(credentialsObject) {
						deepEqual(credentialsObject, srcObject);
					},
					error: function(e) {
						console.log(e)
					}
				},
				0
			)
		};
	
	$MC.encodeAndEncrypt(srcObject, rowSalt, keySlot, mc_callback);
});


module("MintCryptoWrapper -> HexTools");
test( "Given d dec2hexChar(d) returns hexadecimal representation of the value", function() {
	equal($MC.dec2hexChar(255), "ff");
	equal($MC.dec2hexChar(254), "fe");
	equal($MC.dec2hexChar(16), "10");
	equal($MC.dec2hexChar(10), "0a", "Handles single digit (<16) conversions");
	equal($MC.dec2hexChar(0), "00", "Handles 0 correctly");
	equal($MC.dec2hexChar(1), "01");
});

test( "Given h hex2decChar(h) returns decimal representation of the hexadecimal character string", function() {
	equal($MC.hex2decChar("0a"), 10);
	equal($MC.hex2decChar("01"), 01);
	equal($MC.hex2decChar("0"), 0);
	equal($MC.hex2decChar("00"), 0);
	equal($MC.hex2decChar("a"), 10);
	equal($MC.hex2decChar("ff"), 255);
	equal($MC.hex2decChar("ab"), 171);
	equal($MC.hex2decChar("9a"), 154);
});

test( "Given a plaintext string, Str2Hex(plaintext) returns the hexadecimal representation when interpreted as ASCII", function() {
	equal(
		$MC.Str2Hex("Given a plaintext string, returns the hexadecimal representation when interpreted as ASCII"),
		"476976656e206120706c61696e7465787420737472696e672c2072657475726e73207468652068657861646563696d616c20726570726573656e746174696f6e207768656e20696e746572707265746564206173204153434949",
		"Simple ASCII String Conversion"
	);
	equal(
		$MC.Str2Hex("	"),
		"09",
		"Handles Tab Character"
	);
	equal(
		$MC.Str2Hex("\0"),
		"00",
		"Handles NULL Byte"
	);
	equal(
		$MC.Str2Hex("Hello\tHowAreYou?\rI'mGreat\nExcellent\a\0Yes"),
		"48656c6c6f09486f77417265596f753f0d49276d47726561740a457863656c6c656e746100596573",
		"Handles String with control characters in"
	);
});

test( "Given a string containing hex representation of bytes Hex2Str(string) returns a string of the raw values", function() {
	equal(
		$MC.Hex2Str("476976656e206120737472696e6720636f6e7461696e696e672068657820726570726573656e746174696f6e206f662062797465732072657475726e73206120737472696e67207769746820746865207261772076616c756573"), 
		"Given a string containing hex representation of bytes returns a string with the raw values",
		"Simple ASCII String Conversion"
	);
	equal(
		$MC.Hex2Str("09"),
		"	",
		"Handles Tab Character"
	);
	equal($MC.Hex2Str("48656c6c6f09486f77417265596f753f0d49276d47726561740a457863656c6c656e746100596573"),
		"Hello\tHowAreYou?\rI'mGreat\nExcellent\a\0Yes",
		"Handles String with control characters in"
	);
});

test("Given a string containing a hex representation of bytes Hex2Array(string) returns an array of the raw values", function() {
	deepEqual(
		$MC.Hex2Array("303132333435"), 
		[48,49,50,51,52,53], 
		"Handles list of bytes"
	);
	deepEqual(
		$MC.Hex2Array("000102030405"),
		[0,1,2,3,4,5],
		"Handles basic string with values < 10"
	);
	deepEqual($MC.Hex2Array("48656c6c6f09486f77417265596f753f0d49276d47726561740a457863656c6c656e746100596573"),
		[72,101,108,108,111,9,72,111,119,65,114,101,89,111,117,63,13,73,39,109,71,114,101,97,116,10,69,120,99,101,108,108,101,110,116,97,0,89,101,115],
		"Handles String with control characters in"
	);
});

test("Given an array Array2Hex(array) returns an string of the hex values", function() {
	equal(
		$MC.Array2Hex([48,49,50,51,52,53]), 
		"303132333435",
		"Handles list of bytes"
	);
	equal(
		$MC.Array2Hex([0,1,2,3,4,5]),
		"000102030405",
		"Handles basic string with values < 10"
	);
	equal($MC.Array2Hex([72,101,108,108,111,9,72,111,119,65,114,101,89,111,117,63,13,73,39,109,71,114,101,97,116,10,69,120,99,101,108,108,101,110,116,97,0,89,101,115]),
		"48656c6c6f09486f77417265596f753f0d49276d47726561740a457863656c6c656e746100596573",
		"Handles String with control characters in"
	);
});

test("Given a string Array2Hex(array) and Hex2Array can be chained to get the original string", function() {
	var a = "98735ab107914245536118990a173b";
	equal(
		$MC.Array2Hex($MC.Hex2Array(a)),
		a,
		"String is not corrupted through Hex2Array and Array2Hex"
	);
});

module("MintCryptoWrapper + SHA");
test ("The hash function produces a key of the correct length", function() {
	var shaObj = new jsSHA("this is the password to be hashed innit","ASCII");
	var encryptKeyText	= $MC.Hex2Str(shaObj.getHash("SHA-256","HEX"));
	equal(encryptKeyText.length, 256/8, "Key is 256 bits long")
});