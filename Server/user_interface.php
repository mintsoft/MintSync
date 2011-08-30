<?php

/**
	User Interface
*/

if(empty($_SERVER['HTTPS']) || $_SERVER['HTTPS']==="off")	//off is the value when using IIS+ISAPI
{
	echo "<h1>Error: HTTPS is REQUIRED</h1>
			<h2>if it is already enabled then ensure that SSL environmental variables are exported to PHP (SSLOptions +StdEnvVars in Apache)</h2>";
	exit();
}

$action="";
if(isset($_REQUEST['action']))
	$action = $_REQUEST['action'];
	
switch($action)
{
	case "backup":
		if(empty($_REQUEST['output']))
		{
			header("Content-Description: Backup");
			header("Content-Disposition: attachment; filename=MintSyncBackup_".date("Y-m-d").".csv.");
			header("Content-Type: text/csv");
			header("Content-Transfer-Encoding: binary");
		}
		
		$db = new PDO('sqlite:'.PASSWORD_DATABASE);
		$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		$stmt = $db->prepare("SELECT * FROM auth;");
		$stmt->execute();
		
		$stdout = fopen("php://output","w");
		while(($row=$stmt->fetch(PDO::FETCH_ASSOC))!==false)
		{
			fputcsv($stdout, $row, ',', '"');  
		}
		
	break;
	case "dbdump":
		$db = new PDO('sqlite:'.PASSWORD_DATABASE);
		$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		$stmt = $db->prepare("SELECT * FROM auth");
		$stmt->execute();

		$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
		echo "<pre>";
		echo htmlentities(print_r($rows,true));
		echo "</pre>";
	break;
	
	case "ui":
	default:
	
?>
<!DOCTYPE HTML>
 <html>
 <head>
	<title>MintSync Serverside User Interface</title>
	<link rel="stylesheet" href="../Client/Opera_Extension/css/common.css" type="text/css" />
	<link rel="stylesheet" href="./css/ui.css" type="text/css" />
	<link rel="stylesheet" href="css/ui.css" type="text/css" />
 </head>
 <body>
	<div class='mint_mainContainer' id='serverContainer'>
		<h1>ServerSide-User Interface</h1>
		<ul class='styled'>
			<li><span><a href='?action=backup'>Backup Password Database (encrypted)</a> - <a href='?action=backup&amp;output=browser'>View in browser</a></span></li>
			<li><a href='?action=dbdump'>Debug Database View (encrypted)</a></li>
		</ul>
	</div>
 </body>
 </html>
 
 <?php
 }
 ?>