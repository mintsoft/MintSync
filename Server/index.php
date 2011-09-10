<?php

require_once 'config.php';

if(empty($_GET['AJAX']) && !SERVER_UI_LOCKED)
	require_once ("user_interface.php");
else
	require_once ("JSON_service.php");

?>