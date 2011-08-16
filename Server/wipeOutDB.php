<?php

require_once 'config.php';


	$db = new PDO('sqlite:'.PASSWORD_DATABASE);
	$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$stmt = $db->prepare("DELETE FROM auth");
	$stmt->execute();
	
?>