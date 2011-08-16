<?php 

require_once 'config.php';

$domain = ""; 
$returnValues = array();

switch($_GET['action'])
{
	case "save":
		
		$db = new PDO('sqlite:'.PASSWORD_DATABASE);
		$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

		if(isset($_REQUEST['URL']) && isset($_REQUEST['rowSalt']) && isset($_REQUEST['Credentials']))
		{
			$stmt = $db->prepare("SELECT COUNT(*) AS Freq FROM auth WHERE URL=:url");
			$stmt->bindValue(":url",strtolower($_REQUEST['URL']));
			$stmt->execute();
		
			$row = $stmt->fetch(PDO::FETCH_ASSOC);
			if((int)$row['Freq']>0)
			{
				echo "ERROR";
				exit();
			}
			
			$stmt = $db->prepare("INSERT INTO auth(URL,Salt,Credentials) VALUES(:url,:salt,:credentials)");
		
			$stmt->bindValue(":url", strtolower($_REQUEST['URL']));
			$stmt->bindValue(":salt", $_REQUEST['rowSalt']);
			$stmt->bindValue(":credentials", $_REQUEST['Credentials']);
			$stmt->execute();
		
			echo json_encode($_REQUEST);
		}
		
	break;

	case "retrieve":
	default:
		if(isset($_REQUEST['URL']))
			$domain = strtolower($_REQUEST['URL']);
			
		$db = new PDO('sqlite:'.PASSWORD_DATABASE);
		$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		
		$stmt = $db->prepare("SELECT * FROM auth WHERE URL=:url");
		$stmt->bindValue(":url",	$domain, PDO::PARAM_STR );
		$stmt->execute();
		
		$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

		echo json_encode($rows[0]);
}

?>