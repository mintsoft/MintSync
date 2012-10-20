<?php

require_once 'server_components.php';

if (empty($_GET['AJAX']))
	require_once ("user_interface.php");
else
	require_once ("JSON_service.php");
?>