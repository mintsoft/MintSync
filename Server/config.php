<?php

define("PASSWORD_DATABASE", "/var/wwws/code/mintsync_master/Server/db/pass.db");
define("PDO_DSN",'sqlite:'.PASSWORD_DATABASE);
define("LOGGING", true);
define("SERVER_UI_LOCKED", false);

$LOGLEVEL = array(
				"retrieve"	=>	true,
				"save"		=>	true,
				"check"		=>	false,
				"list"		=>  true,
				"rename"	=>	true,
				"remove"	=>	true,
				
				"zz"		=>	false	//placeholder for the last element
			);


?>