<?php
/**
 * TODO: Refactor this page massively.
 * 
 * User Interface
 */
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === "off") //off is the value when using IIS+ISAPI
{
	echo "<h1>Error: HTTPS is REQUIRED</h1>
			<h2>if it is already enabled then ensure that SSL environmental variables are exported to PHP (SSLOptions +StdEnvVars in Apache)</h2>";
	exit();
}

if (SERVER_UI_LOCKED)
{
	header("Location: ./UI");
	exit();
}

/**
 * Output the Header HTML markup
 */
function header_html()
{
	?>
	<!DOCTYPE HTML>
	<html>
		<head>
			<title>MintSync Server Interface</title>
			<link rel="stylesheet" href="css/client-common.css" type="text/css" />
			<link rel="stylesheet" href="css/ui.css" type="text/css" />
			<script type="text/javascript" src='js/jquery.js'></script>
			<script type="text/javascript" src='js/sha.js'></script>
			<script type="text/javascript" src='js/AES.js'></script>
			<script type="text/javascript" src='js/ui.js'></script>
		</head>
		<body>
			<div class='mint_mainContainer' id='serverContainer'>
				<?php
			}

			/**
			 * Output the footer markup
			 */
			function footer_html()
			{
				?>
			</div>
		</body>
	</html>
	<?php
}

$action = "";
if (isset($_REQUEST['action']))
	$action = $_REQUEST['action'];

switch ($action)
{
	case "backup":
		if (empty($_REQUEST['output']))
		{
			header("Content-Description: Backup");
			header("Content-Disposition: attachment; filename=MintSyncBackup_" . date("Y-m-d") . ".csv.");
			header("Content-Type: text/csv");
			header("Content-Transfer-Encoding: binary");
		}

		$db = new PDO(PDO_DSN);
		$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		$stmt = $db->prepare("SELECT * FROM auth INNER JOIN User ON (User.ID=auth.userID);");
		$stmt->execute();

		$stdout = fopen("php://output", "w");
		while (($row = $stmt->fetch(PDO::FETCH_ASSOC)) !== false)
		{
			fputcsv($stdout, $row, ',', '"');
		}

	break;
	case "dbdump":
		$db = new PDO(PDO_DSN);
		$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		$stmt = $db->prepare("SELECT * FROM auth INNER JOIN User ON (User.ID=auth.userID);");
		$stmt->execute();

		$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
		echo "<pre>";
		echo htmlentities(print_r($rows, true));
		echo "</pre>";
	break;
	case "adduser":
		header_html();
		?>
		<h1>Add User</h1>
		<form action='javascript: void(0);' id='adduser'>
			<ul class='form'>
				<li><h2>Authentication</h2></li>
				<li><p>These credentials are used to retrieve your URL lists and grant you the ability to add/delete passwords, they are not used in the cryptography.</p></li>
				<li><label>Username</label><input type='text' name='username' id='username' required/></li>
				<li><label>Password</label><input type='password' name='password1' id='password1' required/></li>
				<li><label>Password (again)</label><input type='password' name='password2' id='password2' required/></li>
				<li><h2>Encryption</h2></li>
				<li><label>Crypto Password</label><input type='password' name='cryptopassword1' id='cryptopassword1' required/></li>
				<li><p>
						This is the password you will use to encrypt your keySlot with. The actual encryption key will be a randomly generated KeySlot (512bit/64character key) concatenated with the rowSalt. The KeySlot will be stored server-side encrypted with a SHA-256 of the SHA-512 of the password entered here.
					</p>
					<p>
						The information you enter here will NOT be sent to the server as it is, it will be hashed twice before transmission. Therefore the server is able to verify the encryption key entered but does not itself contain enough information to decrypt your credentials.
					</p>
				</li>
				<li><label>Crypto Password (again)</label><input type='password' name='cryptopassword2' id='cryptopassword2' required/></li>
			</ul>
			<p class='centeredContents'><input type='submit' /></p>
		</form>
		<?php
		footer_html();
	break;
	case "ui":
	default:
		header_html();
		?>
		<h1>MintSync Server Interface</h1>
		<ul class='styled'>
			<li><span><a href='./UI'>Read Only Client UI</a></span></li>
			<li><span><a href='?action=backup'>Backup Password Database (encrypted)</a> - <a href='?action=backup&amp;output=browser'>View in browser</a></span></li>
			<li><a href='?action=dbdump'>Debug Database View (encrypted)</a></li>
			<li><a href='?action=adduser'>Add User</a></li>
			<li><a href='migrate.php'>Perform Migrations</a></li>
			<li><a href='cryptoSchemeMigration.php'>cryptoScheme Migration (0->1)</a></li>
		</ul>
		<?php
		footer_html();
}
?>
