<?php 

require_once 'server_components.php';

//check for HTTPs, if not then JSON an error
if(empty($_SERVER['HTTPS']) || $_SERVER['HTTPS']==="off")	//off is the value when using IIS+ISAPI
{
    $restTools = new restTools();
	$restTools->sendResponse(array(
								"status"=>"fail",
								"action"=>"",
								"data"=>array(
									"reason"=>"HTTPS is required, if it is already enabled then ensure that SSL environmental variables are exported to PHP (SSLOptions +StdEnvVars in Apache)"
								)
							),412);
}

$userID = user_login::validate();

$db = new PDO(PDO_DSN);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$dbSchema = new schema_version($db);
$dbSchema->checkAndMigrate();

$mintsyncServer = new mintsync_server($db, $userID);

//add header for matching server version against client version
$serverSchemaVersion = $dbSchema->retrieveCurrentSchemaVersion();
$mintsyncServer->addheader("X-MS-Server-Version: ".$serverSchemaVersion);

//REST services:
//Convert Type of request into the relevant action
$_PUT = array();
$action = "";

$request = strtolower($_SERVER['REQUEST_METHOD']);
switch($request)
{
	case "get":							//RETRIEVE for old Versions
		if(isset($_GET['action']))
			$action = $_GET['action'];
	break;
	case "post":						//INSERT or RETRIEVE or CHECK (works for all length URLs)
		if(isset($_GET['action']))
			$action = $_GET['action'];
	break;
	case "put":							//UPDATE 
		$action = $_GET['action'];
		$put_vars="";
		parse_str(file_get_contents('php://input'), $put_vars);
		$_PUT = $put_vars;
	break;
	case "delete":						//DELETE
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
    case NULL:
    case "":
    case "retrieve":   //GET or POST Request
        $mintsyncServer->retrieve();
    break;
    case "list":			//GET Request
        $mintsyncServer->listCredentials();
	break;
	case "save":		//POST
        if(isset($_REQUEST['URL']) && isset($_REQUEST['rowSalt']) && isset($_REQUEST['Credentials']))
            $mintsyncServer->save();
	break;
	case "remove":			//DELETE Request
        if(empty($_REQUEST['ID']))
		{
			$this->restTool->sendResponse(array(
					"status"=>"fail", 
					"action"=>"remove",
					"data"=> array(
						"reason" => "A piece of information is missing: ID"
					)
				),400);	//Bad Request
		}
        
        $mintsyncServer->remove($_REQUEST['ID']);
	break;
	case "rename":			//PUT Request
		if(empty($_PUT['newURL']) || empty($_PUT['ID']) || $_PUT['newURL']==="null") 
		{
			$this->restTool->sendResponse(array(
									"status"=>"fail",
									"action"=>"rename",
									"data"=>array (
										"reason"=>"Required data was missing"
									)
								),400);	//Bad Request
		}
        
		$mintsyncServer->rename($_PUT['ID'], $_PUT['newURL']);
	break;
	case "check":			//GET or POST Request
        if(isset($_REQUEST['URL']))
		{
            $domain = strtolower($_REQUEST['URL']);
            $mintsyncServer->check($domain);
        }
	break;
	case "confirmCrypto":		//check that the hash serverside is the same as the sent one
        if(isset($_GET['cryptoHash']))
            $mintsyncServer->confirmCrypto($_GET['cryptoHash']);
	break;
	case "retrieveKeySlot0":	
		$mintsyncServer->retrieveKeySlot();
    break;
    case "setKeySlot": 	//PUT Request
        global $_PUT;
		if(empty($_PUT['newKeySlot']) || empty($_PUT['newKeySlot0PassHash']) ) 
		{
			$this->restTool->sendResponse(array(
									"status"=>"fail",
									"action"=>"setKeySlot",
									"data"=>array (
										"reason"=>"Required data was missing"
									)
								),400);	//Bad Request
		}
		
        $mintsyncServer->setKeySlot(0, $_PUT['newKeySlot'], $_PUT['newKeySlot0PassHash']);
	break;
}

$this->restTool->sendResponse(array(
                                "status" => "fail",
                                "action" => $action,
                                "data" => array (
                                    "reason" => "Required data was missing"
                                )
                            ),400);	//Bad Request

?>