<?php 

require_once 'config.php';

$domain = ""; 
$returnValues = array();

$action = "retrieve";
if(isset($_GET['action']))
	$action = $_GET['action'];
	
switch($action)
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
		
			$stmt = $db->prepare("SELECT * FROM auth WHERE URL=:url");
			$stmt->bindValue(":url", strtolower($_REQUEST['URL']), PDO::PARAM_STR );
			$stmt->execute();
		
			$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
		
			echo json_encode($rows[0]);
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

		
		if(isset($rows[0]))
			echo json_encode(array("status"=>"ok", "data"=> $rows[0]));
		else 
			echo json_encode(array("status"=>"not-found"));
		
}

?>