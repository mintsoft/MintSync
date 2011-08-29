<?php

/**
	User Interface
*/

$action="";
if(isset($_REQUEST['action']))
	$action = $_REQUEST['action'];
	
switch($action)
{
	case "backup":
	
		header("Content-Description: Backup");
		header("Content-Disposition: attachment; filename=MintSyncBackup_".date("Y-m-d").".csv.");
		header("Content-Type: text/csv");
		header("Content-Transfer-Encoding: binary");
		
		
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
	case "ui":
	default:
	
?>
<!DOCTYPE HTML>
 <html>
 <head>
	<title>MintSync Serverside User Interface</title>
	<link rel="stylesheet" href="../Client/Opera_Extension/css/common.css" type="text/css" />
	<link rel="stylesheet" href="../Client/Opera_Extension/css/passwordMatrix.css" type="text/css" />
	<link rel="stylesheet" href="css/ui.css" type="text/css" />
 </head>
 <body>
	<div class='mint_mainContainer' id='serverContainer'>
		<h1>User Interface</h1>
		<ul>
			<li><a href='?action=backup'>Backup Password Database (encrypted)</a></li>
		</ul>
	</div>
 </body>
 </html>
 
 <?php
 }
 ?>