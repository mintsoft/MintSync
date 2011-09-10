<?php

define("PASSWORD_DATABASE", "/media/WD-250_md0/dbs/pass.db");
define("PDO_DSN",'sqlite:'.PASSWORD_DATABASE);
define("LOGGING", true);
define("SERVER_UI_LOCKED", true);

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