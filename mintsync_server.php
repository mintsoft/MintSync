<?php

/**
 * MintSync Server object, handles all responses with 
 *
 */
class mintsync_server {
    /**
     * PDO Database Connection
     * @var PDO 
     */
    private $db;
    /**
     * 
     * @var Integer The currently logged in UserID 
     */
    private $userID;
    private $restTool;
    
    /**
     * Create a new server instance
     * @param PDO $php_dbo PDO representing the database connection to use
     * @param integer $userID The ID of the logged in User
     */
    public function __construct($php_dbo, $userID) {
        $this->db = $php_dbo;
        $this->userID = $userID;
        $this->restTool = new restTools();
    }
    
    /**
     * Retrieve a credentials Object
     */
    public function retrieve($request)
    {
		if(isset($request['ID']))
		{
			$stmt = $this->db->prepare("SELECT auth.*, User.keySlot0 FROM auth 
									INNER JOIN User ON(User.ID=auth.userID) 
									WHERE auth.ID=:authID AND userID=:userID;");
			$stmt->bindValue(":authID",	$request['ID'], PDO::PARAM_INT );
		}
		else
		{
            $domain = strtolower($request['URL']);
			$stmt = $this->db->prepare("SELECT auth.*, User.keySlot0 FROM auth 
									INNER JOIN User ON(User.ID=auth.userID) 
									WHERE :url LIKE URL AND userID=:userID;");
			$stmt->bindValue(":url",	$domain, PDO::PARAM_STR );
		}
		$stmt->bindValue(":userID",	$this->userID, PDO::PARAM_INT);
		$stmt->execute();
		
		$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

		
		if(isset($rows[0]))
		{
            $this->restTool->sendResponse(array(
						"status"=>"ok", 
						"action"=>"retrieve",
						"data"=> $rows[0]
					),200);		//OK
        }		
		else 
		{
            $this->restTool->sendResponse(array(
						"status"=>"fail",
						"action"=>"retrieve",
						"data" => array(
							"reason"=>"URL was not found"
							)
					),404);	//Not Found
        }
    }
    
    /**
     * Check for the existance of a credentialsObject for a URL
     */
    public function check($domain) 
    {
		$stmt = $this->db->prepare("SELECT COUNT(*) num FROM auth WHERE :url LIKE URL AND userID=:userID;");
		$stmt->bindValue(":url",	$domain, PDO::PARAM_STR );
		$stmt->bindValue(":userID",	$this->userID, PDO::PARAM_INT );
		$stmt->execute();
		
		$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
		
		if(isset($rows[0]))
		{
            $this->restTool->sendResponse(array(
						"status"=>"ok", 
						"action"=>"check",
						"data"=> $rows[0]['num']
					),200);
        }
		else 
        {
			$this->restTool->sendResponse(array(
						"status"=>"fail",
						"action"=>"check",
						"data" => array(
							"reason"=>"An Unexpected Error Occurred"
							)
					),400);	//Bad Request
        }
    }
    
    /**
     * Lists Unique ID and URL for the credentialsObjects Stored for a user
     */
    public function listCredentials()
    {
		$stmt = $this->db->prepare("SELECT ID, URL FROM auth WHERE userID=:userID;");
		$stmt->bindValue(":userID",$this->userID, PDO::PARAM_INT );
		$stmt->execute();
		
		$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
		
		if(isset($rows[0]))
		{
            $this->restTool->sendResponse(array(
						"status"=>"ok", 
						"action"=>"list",
						"data"=> $rows
					),200);	//OK
        }		
		else 
		{
            $this->restTool->sendResponse(array(
						"status"=>"fail",
						"action"=>"list",
						"data" => array(
							"reason"=>"No Records Found"
							)
					),404);	//Not Found
        }
    }
    
    /**
     * Saves a credentialsObject against a URL
     */
    public function save()
    {

        if(!empty($_REQUEST['cryptoHash']))
        {
            $stmt = $this->db->prepare("SELECT * FROM User WHERE ID=:userID AND keySlot0PassHash=:cryptoHash");
            $stmt->bindValue(":cryptoHash",$_REQUEST['cryptoHash']);
            $stmt->bindValue(":userID",$this->userID);
            $stmt->execute();
            $rows = $stmt->fetchAll();
            if(!isset($rows[0]))
                $this->restTool->sendResponse(array(
                                "status"=>"fail",
                                "action"=>"insert",
                                "data"=>array(
                                    "reason"=>"Inconsistent Encryption Key"
                                )
                            ),417);		//Expectation Failed
        }

        $stmt = $this->db->prepare("SELECT COUNT(*) AS Freq FROM auth WHERE :url LIKE URL AND userID=:userID;");
        $stmt->bindValue(":url",strtolower($_REQUEST['URL']));
        $stmt->bindValue(":userID",$this->userID);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if((int)$row['Freq']>0 && empty($_REQUEST['force']))
        {
            $this->restTool->sendResponse(array(
                                "status"=>"fail",
                                "action"=>"insert",
                                "data"=>array(
                                    "reason"=>"Record already exists"
                                )
                            ),409);		//Conflict
        }
        elseif((int)$row['Freq']>0 && !empty($_REQUEST['force']))
        {
            $stmt = $this->db->prepare("UPDATE auth SET Salt=:salt, Credentials=:credentials WHERE :url LIKE URL AND userID=:userID;");

            $stmt->bindValue(":url", strtolower($_REQUEST['URL']));
            $stmt->bindValue(":userID", $this->userID);
            $stmt->bindValue(":salt", $_REQUEST['rowSalt']);
            $stmt->bindValue(":credentials", $_REQUEST['Credentials']);
            $stmt->execute();

            $stmt = $this->db->prepare("SELECT * FROM auth WHERE URL=:url AND userID=:userID;");
            $stmt->bindValue(":url", strtolower($_REQUEST['URL']), PDO::PARAM_STR );
            $stmt->bindValue(":userID", $this->userID);
            $stmt->execute();

            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $this->restTool->sendResponse(array(
                                "status"=>"ok",
                                "action"=>"update",
                                "data"=>array()
                            ),205);		//Reset Content
        }
        else
        {
            $stmt = $this->db->prepare("INSERT INTO auth(URL,Salt,Credentials,userID) VALUES(:url,:salt,:credentials,:userID);");

            $stmt->bindValue(":url", str_replace(
                                    array("%"),
                                    array("%%"),
                                    strtolower($_REQUEST['URL']))
                            );
            $stmt->bindValue(":salt", $_REQUEST['rowSalt']);
            $stmt->bindValue(":credentials", $_REQUEST['Credentials']);
            $stmt->bindValue(":userID", $this->userID);
            $stmt->execute();

            $stmt = $this->db->prepare("SELECT * FROM auth WHERE URL=:url AND userID=:userID");
            $stmt->bindValue(":url", strtolower($_REQUEST['URL']), PDO::PARAM_STR );
            $stmt->bindValue(":userID", $this->userID);
            $stmt->execute();

            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(array(
                                "status"=>"ok",
                                "action"=>"insert",
                                "data"=>array()
                            ),200);		//OK
        }
    }
    
    /**
     * Deletes a CredentialsObject
     */
    public function remove($credentialsID)
    {
		$stmt = $this->db->prepare("DELETE FROM auth WHERE ID=:id AND userID=:userID;");
		$stmt->bindValue(":id", $credentialsID,     PDO::PARAM_INT);
		$stmt->bindValue(":userID", $this->userID,  PDO::PARAM_INT);
		$stmt->execute();

		$this->restTool->sendResponse(array(
					"status"=>"ok", 
					"action"=>"remove",
					"data"=> 1
				),200);	//OK
		
    }
    
    /**
     * Changes the URL for a credentialsObject
     * @param integer $ID The UniqueID of the credentialsObject
     * @param string $newURL The New URL 
     */
    public function rename($ID, $newURL)
    {
		//is this new URL a LIKE pattern?
		if(preg_match("/([^%]%[^%])|(^%[^%])|([^%]%$)|(^%$)/", $newURL))
		{
			//check that this isn't a LIKE pattern that conflicts with another LIKE pattern
			//this will deal with *most* eventualities, however in some specific situations it will not detect a conflict
			
			// e.g. SELECT "https://my.%.com/specific/" LIKE "https://%.opera.com/%" 
			//will return false despite the potential for a conflict
			
			//actual solution is going to be to check for non-negative intersection between the patterns
			// similiar issues with REGEX rather than simple PATTERNS:
			// http://sulzmann.blogspot.com/2008/11/playing-with-regular-expressions.html
			// http://www.groupsrv.com/computers/about507565.html
			// http://qntm.org/greenery - python implementation
			
			
			$stmt = $this->db->prepare("SELECT * FROM auth WHERE (URL LIKE :url1 OR :url2 LIKE URL) AND NOT ID=:ID AND userID=:userID");
			
			$stmt->bindValue(":url1", 	$newURL,        PDO::PARAM_STR);
			$stmt->bindValue(":url2", 	$newURL,        PDO::PARAM_STR);
			$stmt->bindValue(":ID", 	$ID,            PDO::PARAM_INT);
			$stmt->bindValue(":userID",	$this->userID, 	PDO::PARAM_INT);
			$stmt->execute();
			
			$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
			if(isset($rows[0]))
			{
				$this->restTool->sendResponse(array(
							"status"=>"fail",
							"action"=>"rename",
							"data"=>array (
								"reason" => "The LIKE pattern conflicts with another LIKE pattern ({$rows[0]['URL']})" 
							)
						),409);	//Conflict
			}
		}
		
		$stmt = $this->db->prepare("UPDATE auth SET URL=:newURL WHERE ID=:ID AND userID=:userID;");
		
		$stmt->bindValue(":newURL",	strtolower($newURL), 	PDO::PARAM_STR);
		$stmt->bindValue(":ID",		$ID,	 				PDO::PARAM_INT);
		$stmt->bindValue(":userID",	$this->userID,		 	PDO::PARAM_INT);
		$stmt->execute();
		
		$stmt = $this->db->prepare("SELECT * FROM auth WHERE URL=:url AND ID=:ID AND userID=:userID;");
		$stmt->bindValue(":url", 	strtolower($newURL), 	PDO::PARAM_STR );
		$stmt->bindValue(":ID",		$ID, 					PDO::PARAM_INT );
		$stmt->bindValue(":userID", $this->userID, 			PDO::PARAM_INT );
		$stmt->execute();
	
		$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
		
		if(isset($rows[0]))
		{	
			$this->restTool->sendResponse(array(
							"status"=>"ok",
							"action"=>"rename",
							"data"=>array()
						),200);	//OK
		}
		else
		{
			$this->restTool->sendResponse(array(
							"status"=>"fail",
							"action"=>"rename",
							"data"=>array (
								"reason" => "SELECT After UPDATE failed, check the database for integrity!" 
							)
						),410);	//Gone
		}
    }
    
    /**
     * Replaces a user's keyslot with a new one
     * @param integer $keySlotIndex        Currently unused, reserved for future use
     * @param string $newKeySlot          The new keyslot value
     * @param string $newKeySlotPassHash  The Hash of the new keyslot encryption key
     */
    public function setKeySlot($keySlotIndex, $newKeySlot, $newKeySlotPassHash)
    {
		$stmt = $this->db->prepare("UPDATE User SET keySlot0=:keySlot, keySlot0PassHash=:keySlotPassHash WHERE ID=:userID;");
		
		$stmt->bindValue(":keySlot",			$newKeySlot,			PDO::PARAM_STR);
		$stmt->bindValue(":keySlotPassHash",	$newKeySlotPassHash,	PDO::PARAM_STR);
		$stmt->bindValue(":userID",				$this->userID,			PDO::PARAM_INT);
		$stmt->execute();
		
		$stmt = $this->db->prepare("SELECT * FROM User WHERE keySlot0=:keySlot AND keySlot0PassHash=:keySlotPassHash AND ID=:userID;");
		$stmt->bindValue(":keySlot",			$newKeySlot,			PDO::PARAM_STR);
		$stmt->bindValue(":keySlotPassHash",	$newKeySlotPassHash,	PDO::PARAM_STR);
		$stmt->bindValue(":userID",				$this->userID,			PDO::PARAM_INT);
		$stmt->execute();
	
		$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
		
		if(isset($rows[0]))
		{	
			$this->restTool->sendResponse(array(
							"status"=>"ok",
							"action"=>"setKeySlot",
							"data"=>array()
						),200);	//OK
		}
		else
		{
			$this->restTool->sendResponse(array(
							"status"=>"fail",
							"action"=>"setKeySlot",
							"data"=>array (
								"reason" => "SELECT After UPDATE failed, check the database for integrity!" 
							)
						),410);	//Gone
		}
	
    }
    
    /**
     * Verify the hash of the Cryptopassword against the stored one in the db
     * @param type $cryptoHash  The 
     */
    public function confirmCrypto($cryptoHash)
    {
		$stmt = $this->db->prepare("SELECT keySlot0PassHash AS cryptoPassHash FROM User WHERE ID=:userID AND keySlot0PassHash=:hash;");
		$stmt->bindValue(":userID", $this->userID,   PDO::PARAM_INT );
		$stmt->bindValue(":hash", $cryptoHash,       PDO::PARAM_STR );
		$stmt->execute();
		
		$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
		if(isset($rows[0]))
		{
            $this->restTool->sendResponse(array(
						"status"=>"ok", 
						"action"=>"confirmCrypto",
						"data"=> $rows[0]
					),200);	//OK
        }
        else
        {
			$this->restTool->sendResponse(array(
						"status"=>"fail", 
						"action"=>"confirmCrypto",
						"data"=> false
					),417);	//Expectation Failed
        }    
    }
    
    /**
     * Retrieves the key for a keyslot
     * @param integer $keySlotIndex Currently unused, reserved for future use
     */
    public function retrieveKeySlot($keySlotIndex=0)
    {
		$stmt = $this->db->prepare("SELECT keySlot0PassHash, keySlot0 FROM User WHERE ID=:userID");
		$stmt->bindValue(":userID",$this->userID, PDO::PARAM_INT );
		$stmt->execute();
		
		$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
		if(isset($rows[0]))
		{
            $this->restTool->sendResponse(array(
						"status"=>"ok", 
						"action"=>"retrieveKeySlot0",
						"data"=> $rows[0]
					),200);	//OK
        }
		else
        {
			$this->restTool->sendResponse(array(
						"status"=>"fail", 
						"action"=>"retrieveKeySlot0",
						"data"=> false
					),417);	//Expectation Failed
        }
    }
    
    /**
     * Exposes the addheader method of the private restTools instance
     */
    public function addheader($header)
    {
        return $this->restTool->addHeader($header);
    }
}


?>
