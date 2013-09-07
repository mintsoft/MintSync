<?php
//Handle Access-Origin Requests first
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: X-MS-Authorisation, Content-Type");
header("Access-Control-Max-Age: 3600");

if(strtolower($_SERVER['REQUEST_METHOD']) == "options")
{
	die;
}
	
?>