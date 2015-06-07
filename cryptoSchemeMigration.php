<!DOCTYPE HTML>
<html>
	<head>
		<title>MintSync Server Interface</title>
		<link rel="stylesheet" href="css/client-common.css" type="text/css" />
		<link rel="stylesheet" href="css/ui.css" type="text/css" />
		<script type="text/javascript" src='js/jquery.js'></script>
		<script type="text/javascript" src='UI/js/jquery.simplemodal-1.4.4.js'></script>
		<script type="text/javascript" src='UI/js/handlebars.js'></script>
		<script type="text/javascript" src='UI/js/jquery-autobars.js'></script>
		
		<script type="text/javascript" src="js/sha.js"></script>
		<script type="text/javascript" src="js/AES.js"></script>
		
		<script type="text/javascript" src="UI/js/php_js/utf8_decode.js"></script>
		<script type="text/javascript" src="UI/js/php_js/utf8_encode.js"></script>
		<script type="text/javascript" src="UI/js/php_js/base64_decode.js"></script>
		<script type="text/javascript" src="UI/js/php_js/base64_encode.js"></script>
		
		<script type="text/javascript" src="UI/js/stubFunctions.js"></script>
		<script type="text/javascript" src="UI/js/MintCryptoWrapper.js"></script>
		<script type="text/javascript" src="UI/js/MintSync.js"></script>
		<script type="text/javascript" src="UI/js/globalfunctions.js"></script>
		<script type="text/javascript" src="UI/js/json2.js"></script>

		<script type="text/javascript" src='cryptoSchemeMigration/schemeMigrateLightboxes.js'></script>
		<script type="text/javascript" src="cryptoSchemeMigration/schemeMigration.js"></script>
		
	</head>
	<body>
		<div class='mint_mainContainer' id='serverContainer_CryptoSchemeMigration'>
			<h1>User migration of CryptoScheme</h1>
			<form action='javascript: void(0);' id='adduser'>
				<ul id='PasswordList' class='hidden styled'></ul>
				
				<p class='centeredContents'><input id='recrypt' type='submit' value='ReCrypt!'/></p>
				
			</form>
		</div>
	</body>
</html>
