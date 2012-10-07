<?php

require_once 'server_components.php';

if(SERVER_UI_LOCKED)
	exit();
	
$db = new PDO(PDO_DSN);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$stmt = $db->prepare("SELECT * FROM User WHERE username=:username");
$stmt->bindValue(":username",$_POST['username']);
$stmt->execute();

$results = $stmt->fetchAll();

$restTools = new restTools();

if(isset($results[0]))
	$restTools->sendResponse(array(
									"status"=>"fail",
									"data"=>array(
										"reason"=>"User Exists"
									)
					),409);	//Conflict
	

$stmt = $db->prepare("INSERT INTO User(username, password, keySlot0PassHash, keySlot0) VALUES(:user, :pass, :cpasshash, :keySlot0);");
$stmt->bindValue(":user",$_POST['username']);
$stmt->bindValue(":pass",$_POST['password']);
$stmt->bindValue(":cpasshash",$_POST['cryptopassword']);
$stmt->bindValue(":keySlot0",$_POST['keySlot0']);
$stmt->execute();
	$restTools->sendResponse(array(
									"status"=>"ok",
									"data"=>array(
										"description"=>"User Added"
									)
					),200);	//OK
?>