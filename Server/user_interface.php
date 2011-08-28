<?php

require_once 'config.php';

if(empty($_REQUEST['AJAX']))
	require_once ("user_interface.php");
else
	require_once ("JSON_service.php");

?>