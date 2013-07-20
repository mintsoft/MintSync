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
use IO::Prompt;			#libio-prompt-perl

my $username = "robtest";
my $password = "password";
my $server_base = "https://set.mintsoft.net/code/MintSync/ServerUI/";
my $debug=1;

my $verb = "list";
$verb = $ARGV[0] if($#ARGV>=0);

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
	
	my $keyslotkey = sha256_hex($cryptoPassword);
	my $cypher = Crypt::Rijndael->new($keyslotkey, Crypt::Rijndael::MODE_CBC() );
	my $rawKey = $cypher->decrypt($$obj->{'data'}{'keySlot0'}) . $$obj->{'data'}{'rowSalt'};
	
	my $actualKey = sha256_hex($rawKey);
	$cypher = Crypt::Rijndael->new($actualKey, Crypt::Rijndael::MODE_CBC() );
	my $base64Decoded = decode_base64($$obj->{'data'}{'Credentials'});
	my $decryptedJson = $cypher->decrypted($base64Decoded);
	print dump($decryptedJson);
}