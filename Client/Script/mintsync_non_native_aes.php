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

require_once("aes-php.php");

$server_base="https://set.mintsoft.net/code/MintSync/ServerUI/";
$targetUrl="$server_base?AJAX=true&action=retrieve&URL=".urlencode("https://github.com/");

$nonce = time();

$a = strToHex(mhash(MHASH_SHA512, $password));
$authString = base64_encode(mhash(MHASH_SHA512,$a.":".$nonce));

$header="X-MS-Authorisation: MintSync1 $username|$nonce|$authString";
$cmd = "curl -sS --header '$header' \"$targetUrl\"";
$result=`curl -sS --header '$header' "$targetUrl"`;

//echo $result;
$result = json_decode($result);

$passwordHash = mhash(MHASH_SHA512,$cryptoPassword);

$keySlotKey = utf8_encode(mhash(MHASH_SHA256, strToHex($passwordHash)));

$keyslot = $result->data->keySlot0;
$keyslot_decrypted = AesCtr::decrypt($keyslot, $keySlotKey, 256);

$rawKey = $keyslot_decrypted.$result->data->Salt;
echo "rawKey_base64, ".base64_encode($rawKey)."\n";

$rowDecryptionKey = utf8_encode(mhash(MHASH_SHA256, utf8_decode($rawKey)));

$result = AesCtr::decrypt(base64_decode($result->data->Credentials), $rowDecryptionKey,256);
$credentials = json_decode($result);
if($credentials)
{
	var_dump($credentials);
}
else
{
	echo "\n\nThe object could not be decoded - the crypto password was incorrect\n";
}


?>