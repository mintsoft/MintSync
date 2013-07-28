<?php

ini_set("display_errors",1);
error_reporting(E_ALL);

function strToHex($string)
{
	$array = unpack("H*", $string);
	return $array[1];
}

//AesCtr::decrypt($_POST['message'], 'L0ck it up saf3', 256)
require_once("aes-php.php");

$username="robtest";
$password="password";
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
$result = json_decode($result,true);

$passwordHash = mhash(MHASH_SHA512,"myverysecurepassword");

echo "passHash, ".strToHex($passwordHash)."\n";

$keySlotKey = utf8_encode(mhash(MHASH_SHA256, strToHex($passwordHash)));
echo "keySlotKey_hex, ".strToHex($keySlotKey)."\n";
//echo "keySlotKey_hex in one line:  ".strToHex(mhash(MHASH_SHA256, strToHex(mhash(MHASH_SHA512, "myverysecurepassword"))))."\n";


//echo "\n\nDEBUGGING SECTION--------------\n\n";
//$key = utf8_encode(mhash(MHASH_SHA256, strToHex(mhash(MHASH_SHA512, "myverysecurepassword"))));
//echo "base64 key, ".base64_encode($key)."\n";
//$x = AesCtr::decrypt("ugIyituTtFEoX3EJ459HRM+15SfgzVjomIb3Bb6jJ8TaOW74CW3tchto4erEg223sCd1YebbcaHIsLM819DnJ1V82a5yHtlkPtVUU8yLoYSCmwSKgoELGRYu3cX4DOes/5KmHaNYMz2qCyiF",
//					$key,
//					256);
//print "hackery: ".base64_encode($x)."\n";

$keyslot = $result["data"]["keySlot0"];
echo "keyslot, ".$keyslot."\n";

$keyslot_decrypted = AesCtr::decrypt($keyslot, $keySlotKey, 256);

$rawKey = $keyslot_decrypted.$result['data']['Salt'];
echo "rawKey_base64, ".base64_encode($rawKey)."\n";

$rowDecryptionKey = utf8_encode(mhash(MHASH_SHA256, utf8_decode($rawKey)));
echo "key_base64, ".base64_encode($rowDecryptionKey)."\n";

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

$result = AesCtr::decrypt(base64_decode($result["data"]["Credentials"]), $rowDecryptionKey,256);

echo "\n\n----\n";
var_dump($result);
echo "\n----\n";


?>