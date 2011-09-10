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

function header_html ()
{	?>
<!DOCTYPE HTML>
 <html>
 	<head>
	<title>MintSync Serverside User Interface</title>
	<link rel="stylesheet" href="../Client/Opera_Extension/css/common.css" type="text/css" />
	<link rel="stylesheet" href="./css/ui.css" type="text/css" />
	<link rel="stylesheet" href="css/ui.css" type="text/css" />
	<script type="text/javascript" src='js/jquery.js'></script>
	<script type="text/javascript" src='js/sha.js'></script>
	<script type="text/javascript" src='js/ui.js'></script>
 </head>
 <body>
	<div class='mint_mainContainer' id='serverContainer'>
<?php
}

function footer_html ()
{	?>
	</div>
 </body>
 </html>
<?php
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

		$db = new PDO(PDO_DSN);
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
		$db = new PDO(PDO_DSN);
		$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		$stmt = $db->prepare("SELECT * FROM auth");
		$stmt->execute();

		$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
		echo "<pre>";
		echo htmlentities(print_r($rows,true));
		echo "</pre>";
	break;
	case "adduser":
		header_html();
?>
	<h1>Add User</h1>
	<form action='javascript: void(0);' id='adduser'>
		<ul class='form'>
			<li><h2>Authentication</h2></li>
			<li><label>Username</label><input type='text' name='username' id='username' required/></li>
			<li><label>Password</label><input type='password' name='password1' id='password1' required/></li>
			<li><label>Password (again)</label><input type='password' name='password2' id='password2' required/></li>
			<li><h2>Encryption</h2></li>
			<li><label>Crypto Password</label><input type='password' name='cryptopassword1' id='cryptopassword1' required/></li>
			<li><label>Crypto Password (again)</label><input type='password' name='cryptopassword2' id='cryptopassword2' required/></li>
		</ul>
		<p><input type='submit' /></p>
	</form>
<?php
		footer_html();
	break;
	case "ui":
	default:
		header_html();
?>
		<h1>ServerSide-User Interface</h1>
		<ul class='styled'>
			<li><span><a href='?action=backup'>Backup Password Database (encrypted)</a> - <a href='?action=backup&amp;output=browser'>View in browser</a></span></li>
			<li><a href='?action=dbdump'>Debug Database View (encrypted)</a></li>
			<li><a href='?action=adduser'>Add User</a></li>
		</ul>
 <?php
		footer_html();
}
?>
