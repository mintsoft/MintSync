<?php

$username="robtest";
$password="password";
$server_base="https://set.mintsoft.net/code/MintSync/ServerUI/";
$targetUrl="$server_base?AJAX=true&action=retrieve&URL=".urlencode("https://github.com/");

$nonce = time();
//$nonce="1";
$a = unpack("H*",mhash(MHASH_SHA512, $password));
$authString = base64_encode(mhash(MHASH_SHA512,$a[1].":".$nonce));

$header="X-MS-Authorisation: MintSync1 $username|$nonce|$authString";
$cmd = "curl -sS --header '$header' \"$targetUrl\"";
//echo $cmd;
$result=`curl -sS --header '$header' "$targetUrl"`;

//echo $result;
$result = json_decode($result,true);

$cryptopassword = mhash(MHASH_SHA512,"myverysecurepassword");
$passwordhash = mhash(MHASH_SHA256, $cryptopassword);

$keyslot_decrypted = mcrypt_decrypt(MCRYPT_RIJNDAEL_256, $passwordhash, base64_decode($result["data"]["keySlot0"]),"ecb");

$rawKey = $keyslot_decrypted.$result['data']['Salt'];

$rowDecryptionKey = mhash(MHASH_SHA256, $rawKey);

$result = mcrypt_decrypt(MCRYPT_RIJNDAEL_256, $rowDecryptionkey, base64_decode($result["data"]["Credentials"]),"ecb");

echo "\n\n----\n$result\n----\n";


?>