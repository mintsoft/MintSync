module("MintCryptoWrapper");

test( "Given known CypherText and keys, Decrypt_strings returns known plaintext", function() {
	var cypher = "AES", keySize = 256;
	equal(
		$MC.Decrypt_strings("", "", cypher, keySize),
		"",
		"Empty String input and empty key returns empty string"
	);
});

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
