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
	my $passwordhash = sha512_hex($cryptoPassword);
#	print $passwordhash.$/;
	my $keyslotkey = pack("H*", sha256_hex($passwordhash));
	my $cypher = Crypt::Rijndael->new($keyslotkey, Crypt::Rijndael::MODE_CBC() );
	my %data = %{$obj->{'data'}};
	
	#print $data{'keySlot0'}." : ".$data{'Salt'};
	#printf ("\n %s \t %s \n", %{$obj->{'data'}}->{'keySlot0'}, %{$obj->{'data'}}->{'Salt'} );
	my $keySlot = %{$obj->{'data'}}->{'keySlot0'};
	
	my $rawKey = $cypher->decrypt($keySlot).%{$obj->{'data'}}->{'Salt'};
	print $rawKey.$/.$/;
	my $actualKey = pack("H*", sha256_hex($rawKey));
	print $actualKey.$/.$/;
	$cypher = Crypt::Rijndael->new($actualKey, Crypt::Rijndael::MODE_CBC() );
	
	my $credentials = %{$obj->{'data'}}->{'Credentials'};
	my $base64Decoded = decode_base64(decode_base64($credentials));
=for	
	while(length($base64Decoded)%16)
	{
		$base64Decoded.="\0" ;	#nice bit of NULL padding? is this required?
	}
=cut
	print $base64Decoded.$/.$/;
	my $decryptedJson = $cypher->decrypt($base64Decoded);
	#print dump($decryptedJson);
	print $decryptedJson;
}