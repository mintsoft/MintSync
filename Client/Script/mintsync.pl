#!/usr/bin/env perl
use warnings;
use strict;

#use Data::Dumper;
use Data::Dump qw(dump);
use Digest::SHA qw(sha256 sha256_hex sha256_base64 sha512 sha512_hex sha512_base64);
use Crypt::Rijndael;	#Debian Package: libcrypt-rijndael-perl
use JSON::PP;			#Debian Packagelibjson-perl 
use MIME::Base64;
#use WWW::Curl::Easy;	#libwww-curl-perl
#use IO::Prompt;			#libio-prompt-perl
#use utf8;

my $username = "robtest";
my $password = "password";
my $server_base = "https://set.mintsoft.net/code/MintSync/ServerUI/";
my $debug=1;

my $verb = "list";
$verb = $ARGV[0] if($#ARGV>=0);
=for
#Testing stuffs

my $cypher = Crypt::Rijndael->new("12345678901234567890123456789012", Crypt::Rijndael::MODE_CTR() );
my $temp = decode_base64("WAEr/B007FEDaoRsAAAAAA==");

#print length($temp)."\t".unpack("H*",$temp);

print $cypher->decrypt($temp);
#print encode_base64($cypher->encrypt("helloworld!!!!!!"));

die;
=cut
sub hit_mintsync_service
{
	my ($args) = @_;
	print "args: ".dump($args)."\n" if($debug);
	
	my $additional_get_params = "";
	$additional_get_params .= "&".$_."=".$$args{$_} foreach(keys %$args);
	
	my $targetUrl = "$server_base?AJAX=true&action=$verb".$additional_get_params;
	print "$targetUrl\n" if$debug;
	my $nonce = time;
	
	#my $nonce='hWP3d#v}g#3RpVlV~yn3gvl@QL(3{"gd';
	my $authString = sha512_base64(sha512_hex($password).":".$nonce);
	
	while(length($authString) % 4){
		$authString .= "=";
	}
	
	my $authScheme = "X-MS-Authorisation: MintSync1 $username|$nonce|$authString";
	my @headers = ();

	print "Auth Header: $authScheme\n" if($debug);
	push @headers, $authScheme;

	#TODO: replace with libcurl? 
	my $curl_headers="";
	$curl_headers .= "--header '$_'" foreach(@headers);
	
	my $jsonStr = `curl -sS $curl_headers "$targetUrl"`;
	my $obj = decode_json($jsonStr);
	print dump($obj)."\n" if($debug);
	return $obj;
}

sub decrypt_credentials_object
{
	my ($obj) = @_;
	
}

sub base64decode_pad
{
	my $a = pop;
	$a=decode_base64($a);
	while(length($a)%16)
	{
		$a.="\0";
	}
	return $a;
}

my $obj;
if($verb =~ /list/)
{
	$obj=hit_mintsync_service();	
	printf("%s: %s\n", $$_{'ID'}, $$_{'URL'}) foreach(@{$obj->{'data'}});
}
elsif($verb =~ /retrieve/)
{
	$obj=hit_mintsync_service({URL => $ARGV[1]});
	my $cryptoPassword="myverysecurepassword";
	my $passwordhash = sha512_hex($cryptoPassword);
	
	print "keyslotkey_hex ".sha256_hex($passwordhash).$/;
	
	my $keyslotkey = pack("H*", sha256_hex($passwordhash));
	my $cypher = Crypt::Rijndael->new($keyslotkey, Crypt::Rijndael::MODE_CTR() );
	
	my $keySlot = %{$obj->{'data'}}->{'keySlot0'};
	print "keySlot $keySlot\n";
	$keySlot=base64decode_pad($keySlot);
	print "keySlotRaw ".unpack("H*",$keySlot)."\n";
	
	my $decrypted = $cypher->decrypt($keySlot);
	my $salt = %{$obj->{'data'}}->{'Salt'};
	
	my $rawKey = "$decrypted$salt";
	print "rawKey_hex ".unpack("H*",$rawKey).$/;
	
	print "rawKey sha256_hex ".sha256_hex($rawKey).$/;
	
	my $actualKey = pack("H*", sha256_hex($rawKey));
	$cypher = Crypt::Rijndael->new($actualKey, Crypt::Rijndael::MODE_CTR() );
	
	my $credentials = %{$obj->{'data'}}->{'Credentials'};
#	print "\t$credentials\n";
	my $base64Decoded = base64decode_pad(decode_base64($credentials));	

	#print $base64Decoded.$/.$/;
	my $decryptedJson = $cypher->decrypt($base64Decoded);
	print dump($decryptedJson);
	#print $decryptedJson;
}