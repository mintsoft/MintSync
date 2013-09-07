<?php

ini_set("display_errors",1);
error_reporting(E_ALL);

function strToHex($string)
{
	$array = unpack("H*", $string);
	return $array[1];
}

$options = getopt("u:p:P:",array("username:", "password:", "crypto-password:"));
$username = $options['u'] || $options['username'];
$password = $options['p'] || $options['password'];
$cryptoPassword = $options['P'] || $options['crypto-password'];

//AesCtr::decrypt($_POST['message'], 'L0ck it up saf3', 256)
require_once("aes-php.php");

$server_base="https://set.mintsoft.net/code/MintSync/ServerUI/";
$targetUrl="$server_base?AJAX=true&action=retrieve&URL=".urlencode("https://github.com/");

$nonce = time();

$a = strToHex(mhash(MHASH_SHA512, $password));
$authString = base64_encode(mhash(MHASH_SHA512,$a.":".$nonce));

$header="X-MS-Authorisation: MintSync1 $username|$nonce|$authString";
$cmd = "curl -sS --header '$header' \"$targetUrl\"";
//echo $cmd;
$result=`curl -sS --header '$header' "$targetUrl"`;

//echo $result;
$result = json_decode($result);

$passwordHash = mhash(MHASH_SHA512,$cryptoPassword);

//echo "passHash, ".strToHex($passwordHash)."\n";

$keySlotKey = utf8_encode(mhash(MHASH_SHA256, strToHex($passwordHash)));

//echo "keySlotKey : ".base64_encode($keySlotKey)."\n";

//$keyslot = $result["data"]["keySlot0"];
$keyslot = $result->data->keySlot0;
//echo "keyslot, ".$keyslot."\n";

$keyslot_decrypted = AesCtr::decrypt($keyslot, $keySlotKey, 256);

$rawKey = $keyslot_decrypted.$result->data->Salt;
echo "rawKey_base64, ".base64_encode($rawKey)."\n";

$rowDecryptionKey = utf8_encode(mhash(MHASH_SHA256, utf8_decode($rawKey)));
//echo "key_base64, ".base64_encode($rowDecryptionKey)."\n";

/*
print "\n\n\n";
print base64_encode(utf8_encode
	(mhash(MHASH_SHA256,
		utf8_decode(base64_decode("woQFbmPDm8KLWMORDmhRJGAVfcK2wonCkkXDucK3Q8OLwr3Cm8OjQsKNwq3Dj8OgwrDCi8KuwqhIw5/CoMKAw55JwppNwrfDrzk0wqfDoCTDjAQVwrdvdsOGw4fDmyR9XMK5VDJYcGVgVUE4eytMP080VGNuQ0hcKyRWdCY8YydUcUU2"))
	))
);

die;
*/
//$result = mcrypt_decrypt(MCRYPT_RIJNDAEL_256, $rowDecryptionKey, base64_decode($result["data"]["Credentials"]),"ecb");
//$result = mcrypt_decrypt(MCRYPT_RIJNDAEL_256, $rowDecryptionKey, base64_decode($result["data"]["Credentials"]),"ecb");
// we correct to here! ----------------------------------------------------------------------

$result = AesCtr::decrypt(base64_decode($result->data->Credentials), $rowDecryptionKey,256);
$credentials = json_decode($result);
if($credentials)
{
	//echo "\n\n----\n";
	var_dump($credentials);
	//echo "\n----\n";
}
else
{
	echo "\n\nThe object could not be decoded - the crypto password was incorrect\n";
}


?>