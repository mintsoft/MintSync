<?php 

require_once 'REST_Helpers.php';
require_once 'user_login.php';

//check for HTTPs, if not then JSON an error
if(empty($_SERVER['HTTPS']) || $_SERVER['HTTPS']==="off")	//off is the value when using IIS+ISAPI
{
	restTools::sendResponse(array(
								"status"=>"fail",
								"action"=>"",
								"data"=>array(
									"reason"=>"HTTPS is required, if it is already enabled then ensure that SSL environmental variables are exported to PHP (SSLOptions +StdEnvVars in Apache)"
								)
							),412);
}

$userID = user_login::validate();

$domain = ""; 
$returnValues = array();

$db = new PDO(PDO_DSN);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

//REST services:
//Convert Type of request into the relevant action
$request = strtolower($_SERVER['REQUEST_METHOD']);
$_PUT = array();
switch($request)
{
	case "get":							//RETRIEVE
		if(isset($_GET['action']))
			$action = $_GET['action'];
		else
			$action = "";
	break;
	case "post":							//INSERT
		$action = "save";
	break;
	case "put":							//UPDATE 
		$action = $_GET['action'];
		$put_vars="";
		parse_str(file_get_contents('php://input'), $put_vars);
		$_PUT = $put_vars;
	break;
	case "delete":							//DELETE
		$action = "remove";
	break;
}


//do logging if enabled
if(LOGGING && !(isset($LOGLEVEL[$action]) && $LOGLEVEL[$action]==false))		//if log level is undefined, then assume we wish to log
{
	$stmt = $db->prepare("INSERT INTO AccessLog(Timestamp,RemoteIP,Request,UserID) VALUES(strftime('%s','now'),:IP,:request,:userID);");
	$stmt->bindValue(":IP",ip2long($_SERVER['REMOTE_ADDR']));
	$stmt->bindValue(":request",$_SERVER['REQUEST_METHOD'].": ".
		var_export( array( 'GET' => $_GET,
							'POST' => $_POST,
							'PUT'  => $_PUT	),true));
	$stmt->bindValue(":userID",$userID);
	$stmt->execute();
}

switch($action)
{
	case "save":		//POST

		if(isset($_REQUEST['URL']) && isset($_REQUEST['rowSalt']) && isset($_REQUEST['Credentials']))
		{
			
			if(!empty($_REQUEST['cryptoHash']))
			{
				$stmt = $db->prepare("SELECT * FROM User WHERE ID=:userID AND keySlot0PassHash=:cryptoHash");
				$stmt->bindValue(":cryptoHash",$_REQUEST['cryptoHash']);
				$stmt->bindValue(":userID",$userID);
				$stmt->execute();
				$rows = $stmt->fetchAll();
				if(!isset($rows[0]))
					restTools::sendResponse(array(
									"status"=>"fail",
									"action"=>"insert",
									"data"=>array(
										"reason"=>"Inconsistent Encryption Key"
									)
								),417);		//Expectation Failed
			}
		
			$stmt = $db->prepare("SELECT COUNT(*) AS Freq FROM auth WHERE :url LIKE URL AND userID=:userID;");
			$stmt->bindValue(":url",strtolower($_REQUEST['URL']));
			$stmt->bindValue(":userID",$userID);
			$stmt->execute();
		
			$row = $stmt->fetch(PDO::FETCH_ASSOC);
			if((int)$row['Freq']>0 && empty($_REQUEST['force']))
			{
				restTools::sendResponse(array(
									"status"=>"fail",
									"action"=>"insert",
									"data"=>array(
										"reason"=>"Record already exists"
									)
								),409);		//Conflict
			}
			elseif((int)$row['Freq']>0 && !empty($_REQUEST['force']))
			{
				$stmt = $db->prepare("UPDATE auth SET Salt=:salt, Credentials=:credentials WHERE :url LIKE URL AND userID=:userID;");
			
				$stmt->bindValue(":url", strtolower($_REQUEST['URL']));
				$stmt->bindValue(":userID", $userID);
				$stmt->bindValue(":salt", $_REQUEST['rowSalt']);
				$stmt->bindValue(":credentials", $_REQUEST['Credentials']);
				$stmt->execute();
			
				$stmt = $db->prepare("SELECT * FROM auth WHERE URL=:url AND userID=:userID;");
				$stmt->bindValue(":url", strtolower($_REQUEST['URL']), PDO::PARAM_STR );
				$stmt->bindValue(":userID", $userID);
				$stmt->execute();
			
				$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
			
				restTools::sendResponse(array(
									"status"=>"ok",
									"action"=>"update",
									"data"=>array()
								),205);		//Reset Content
			}
			else
			{
				$stmt = $db->prepare("INSERT INTO auth(URL,Salt,Credentials,userID) VALUES(:url,:salt,:credentials,:userID);");
			
				$stmt->bindValue(":url", str_replace(
										array("%"),
										array("%%"),
										strtolower($_REQUEST['URL']))
								);
				$stmt->bindValue(":salt", $_REQUEST['rowSalt']);
				$stmt->bindValue(":credentials", $_REQUEST['Credentials']);
				$stmt->bindValue(":userID", $userID);
				$stmt->execute();
			
				$stmt = $db->prepare("SELECT * FROM auth WHERE URL=:url AND userID=:userID");
				$stmt->bindValue(":url", strtolower($_REQUEST['URL']), PDO::PARAM_STR );
				$stmt->bindValue(":userID", $userID);
				$stmt->execute();
			
				$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
			
				echo json_encode(array(
									"status"=>"ok",
									"action"=>"insert",
									"data"=>array()
								),200);		//OK
			}
		}
		
	break;
	
	case "remove":			//DELETE Request
	
		if(empty($_REQUEST['ID']))
		{
			restTools::sendResponse(array(
					"status"=>"fail", 
					"action"=>"remove",
					"data"=> array(
						"reason" => "A piece of information is missing: ID"
					)
				),400);	//Bad Request
		}
		$stmt = $db->prepare("DELETE FROM auth WHERE ID=:id AND userID=:userID;");
		$stmt->bindValue(":id",$_REQUEST['ID']);
		$stmt->bindValue(":userID",$userID);
		$stmt->execute();

		restTools::sendResponse(array(
					"status"=>"ok", 
					"action"=>"remove",
					"data"=> 1
				),200);	//OK
		
	break;
	
	case "rename":			//PUT Request
		
		if(empty($_PUT['newURL']) || empty($_PUT['ID']) || $_PUT['newURL']==="null") 
		{
			restTools::sendResponse(array(
									"status"=>"fail",
									"action"=>"rename",
									"data"=>array (
										"reason"=>"Required data was missing"
									)
								),400);	//Bad Request
		}
		
		//is this new URL a LIKE pattern?
		if(preg_match("/([^%]%[^%])|(^%[^%])|([^%]%$)|(^%$)/", $_PUT['newURL']))
		{
			//check that this isn't a LIKE pattern that conflicts with another LIKE pattern
			//this will deal with *most* eventualities, however in some specific situations it will not detect a conflict
			
			// e.g. SELECT "https://my.%.com/specific/" LIKE "https://%.opera.com/%" 
			//will return false despite the potential for a conflict
			
			$stmt = $db->prepare("SELECT * FROM auth WHERE (URL LIKE :url1 OR :url2 LIKE URL) AND NOT ID=:ID AND userID=:userID");
			
			$stmt->bindValue(":url1", 	$_PUT['newURL'],	PDO::PARAM_STR);
			$stmt->bindValue(":url2", 	$_PUT['newURL'],	PDO::PARAM_STR);
			$stmt->bindValue(":ID", 	$_PUT['ID'], 		PDO::PARAM_INT);
			$stmt->bindValue(":userID",	$userID, 			PDO::PARAM_INT);
			$stmt->execute();
			
			$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
			if(isset($rows[0]))
			{
				restTools::sendResponse(array(
							"status"=>"fail",
							"action"=>"rename",
							"data"=>array (
								"reason" => "The LIKE pattern conflicts with another LIKE pattern ({$rows[0]['URL']})" 
							)
						),409);	//Conflict
			}
		}
		
		$stmt = $db->prepare("UPDATE auth SET URL=:newURL WHERE ID=:ID AND userID=:userID;");
		
		$stmt->bindValue(":newURL",	$_PUT['newURL'], PDO::PARAM_STR);
		$stmt->bindValue(":ID",		$_PUT['ID'],	 PDO::PARAM_INT);
		$stmt->bindValue(":userID",	$userID,		 PDO::PARAM_INT);
		$stmt->execute();
		
		$stmt = $db->prepare("SELECT * FROM auth WHERE URL=:url AND ID=:ID AND userID=:userID;");
		$stmt->bindValue(":url", strtolower($_PUT['newURL']), PDO::PARAM_STR );
		$stmt->bindValue(":ID", strtolower($_PUT['ID']), PDO::PARAM_INT );
		$stmt->bindValue(":userID", $userID, PDO::PARAM_INT );
		$stmt->execute();
	
		$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
		
		if(isset($rows[0]))
		{	
			restTools::sendResponse(array(
							"status"=>"ok",
							"action"=>"rename",
							"data"=>array()
						),200);	//OK
		}
		else
		{
			restTools::sendResponse(array(
							"status"=>"fail",
							"action"=>"rename",
							"data"=>array (
								"reason" => "SELECT After UPDATE failed, check the database for integrity!" 
							)
						),410);	//Gone
		}
		
	break;
	
	case "setKeySlot": 	//PUT Request
	
		if(empty($_PUT['newKeySlot']) || empty($_PUT['newKeySlot0PassHash']) ) 
		{
			restTools::sendResponse(array(
									"status"=>"fail",
									"action"=>"setKeySlot",
									"data"=>array (
										"reason"=>"Required data was missing"
									)
								),400);	//Bad Request
		}
		
		$stmt = $db->prepare("UPDATE User SET keySlot0=:keySlot0, keySlot0PassHash=:keySlot0PassHash WHERE ID=:userID;");
		
		$stmt->bindValue(":keySlot0",			$_PUT['newKeySlot'],PDO::PARAM_STR);
		$stmt->bindValue(":keySlot0PassHash",	$_PUT['newKeySlot0PassHash'],PDO::PARAM_STR);
		$stmt->bindValue(":userID",				$userID,PDO::PARAM_INT);
		$stmt->execute();
		
		$stmt = $db->prepare("SELECT * FROM User WHERE keySlot0=:keySlot0 AND keySlot0PassHash=:keySlot0PassHash AND ID=:userID;");
		$stmt->bindValue(":keySlot0",			$_PUT['newKeySlot'],PDO::PARAM_STR);
		$stmt->bindValue(":keySlot0PassHash",	$_PUT['newKeySlot0PassHash'],PDO::PARAM_STR);
		$stmt->bindValue(":userID",				$userID,PDO::PARAM_INT);
		$stmt->execute();
	
		$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
		
		if(isset($rows[0]))
		{	
			restTools::sendResponse(array(
							"status"=>"ok",
							"action"=>"setKeySlot",
							"data"=>array()
						),200);	//OK
		}
		else
		{
			restTools::sendResponse(array(
							"status"=>"fail",
							"action"=>"setKeySlot",
							"data"=>array (
								"reason" => "SELECT After UPDATE failed, check the database for integrity!" 
							)
						),410);	//Gone
		}
	
	break;
	
	case "check":			//GET Request
		if(isset($_GET['URL']))
			$domain = strtolower($_GET['URL']);
		
		$stmt = $db->prepare("SELECT COUNT(*) num FROM auth WHERE :url LIKE URL AND userID=:userID;");
		$stmt->bindValue(":url",	$domain, PDO::PARAM_STR );
		$stmt->bindValue(":userID",	$userID);
		$stmt->execute();
		
		$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

		
		if(isset($rows[0]))
			restTools::sendResponse(array(
						"status"=>"ok", 
						"action"=>"check",
						"data"=> $rows[0]['num']
					),200);
				
		else 
			restTools::sendResponse(array(
						"status"=>"fail",
						"action"=>"check",
						"data" => array(
							"reason"=>"An Unexpected Error Occurred"
							)
					),400);	//Bad Request
	break;
	
	case "list":			//GET Request

		$stmt = $db->prepare("SELECT ID, URL FROM auth WHERE userID=:userID;");
		$stmt->bindValue(":userID",$userID);
		$stmt->execute();
		
		$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
		
		if(isset($rows[0]))
			restTools::sendResponse(array(
						"status"=>"ok", 
						"action"=>"list",
						"data"=> $rows
					),200);	//OK
				
		else 
			restTools::sendResponse(array(
						"status"=>"fail",
						"action"=>"list",
						"data" => array(
							"reason"=>"No Records Found"
							)
					),404);	//Not Found
	break;
	
	case "confirmCrypto":		//check that the hash serverside is the same as the sent one
	
		$testHash = $_GET['cryptoHash'];
	
		$stmt = $db->prepare("SELECT keySlot0PassHash AS cryptoPassHash FROM User WHERE ID=:userID AND keySlot0PassHash=:hash;");
		$stmt->bindValue(":userID",$userID);
		$stmt->bindValue(":hash",$testHash);
		$stmt->execute();
		
		$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
		if(isset($rows[0]))
			restTools::sendResponse(array(
						"status"=>"ok", 
						"action"=>"confirmCrypto",
						"data"=> $rows[0]
					),200);	//OK
		else
			restTools::sendResponse(array(
						"status"=>"fail", 
						"action"=>"confirmCrypto",
						"data"=> false
					),417);	//Expectation Failed
	break;
	
	case "retrieveKeySlot0":		//check that the hash serverside is the same as the sent one
		
		$stmt = $db->prepare("SELECT keySlot0PassHash, keySlot0 FROM User WHERE ID=:userID");
		$stmt->bindValue(":userID",$userID);
		$stmt->execute();
		
		$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
		if(isset($rows[0]))
			restTools::sendResponse(array(
						"status"=>"ok", 
						"action"=>"retrieveKeySlot0",
						"data"=> $rows[0]
					),200);	//OK
		else
			restTools::sendResponse(array(
						"status"=>"fail", 
						"action"=>"retrieveKeySlot0",
						"data"=> false
					),417);	//Expectation Failed
	break;
	
	
	
	case "retrieve":			//GET Request
	default:
		if(isset($_GET['URL']))
			$domain = strtolower($_GET['URL']);
		if(isset($_GET['ID']))
		{
			$stmt = $db->prepare("SELECT auth.*, User.keySlot0 FROM auth 
									INNER JOIN User ON(User.ID=auth.userID) 
									WHERE auth.ID=:authID AND userID=:userID;");
			$stmt->bindValue(":authID",	$_GET['ID'], PDO::PARAM_INT );
		}
		else
		{
			$stmt = $db->prepare("SELECT auth.*, User.keySlot0 FROM auth 
									INNER JOIN User ON(User.ID=auth.userID) 
									WHERE :url LIKE URL AND userID=:userID;");
			$stmt->bindValue(":url",	$domain, PDO::PARAM_STR );
		}
		$stmt->bindValue(":userID",	$userID, PDO::PARAM_INT);
		$stmt->execute();
		
		$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

		
		if(isset($rows[0]))
			restTools::sendResponse(array(
						"status"=>"ok", 
						"action"=>"retrieve",
						"data"=> $rows[0]
					),200);		//OK
				
		else 
			restTools::sendResponse(array(
						"status"=>"fail",
						"action"=>"retrieve",
						"data" => array(
							"reason"=>"URL was not found"
							)
					),404);	//Not Found
		
}

?>