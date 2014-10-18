<?php

define("PASSWORD_DATABASE", "/var/wwws/code/MintSync/ServerUI/db/pass.db");
define("PDO_DSN", 'sqlite:' . PASSWORD_DATABASE);
define("LOGGING", true);
define("SERVER_UI_LOCKED", false);
define("MIGRATIONS_DIRECTORY","./migrations");

$LOGLEVEL = array(
	"retrieve" => true,
	"save" => true,
	"check" => false,
	"list" => true,
	"rename" => true,
	"remove" => true,
	"zz" => false //placeholder for the last element
);
?>