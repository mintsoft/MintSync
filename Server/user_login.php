<?php
/*
	X-MS-Authorisation: MintSync1 Username+"|"+Nonce+"|"+ Base64EncodedAuthString
	base64EncodedAuthString = SHA512.b64(SHA512.hex(Password)+":"+Nonce)
	
	Example: X-MS-Authorisation: MintSync1 fdsg|;$GPtF\=S8APNM4yK^"sE805%l_E[q/B|MOGGNOnzjImU77a3aCRFwwxTOdD8bcuhZtB+4hAudeTexz9T/m7/hLBaK+2f4nzEe9QkeFaThpvSaZ5lUwkoRw
*/

function debugOut($str){
	header("X-MS-Debug: {$str}");
}

class user_login {

	public static function getUserRow($username){
		
		$db = new PDO(PDO_DSN);
		$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		
		$stmt = $db->prepare("SELECT * FROM User WHERE username=:username;");
		$stmt->bindValue(":username",$username);
		$stmt->execute();
		
		$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
		
		return(isset($rows[0])?$rows[0]:null);
	}

	public static function validate(){

		$headers = apache_request_headers();

		list($method, $authHeader) = explode(" ",$headers['X-MS-Authorisation']);
		
		switch($method)
		{
			case "MintSync1":
				
				$auth_components = explode("|", $authHeader);
				//index 0 = username
				//index 1 = rowSalt
				//index 2 = authString
				
				$rows = user_login::getUserRow($auth_components[0]);
				$passhash = $rows['password'];
					
				$srcString = "{$passhash}:{$auth_components[1]}";				
				$ourAuthStr = base64_encode(hash("sha512",$srcString,true));
				if($ourAuthStr!==$auth_components[2])
				{
					restTools::sendResponse(array(
										"status"=>"fail",
										"data"=>array(
											"reason"=>"Authentication Error"
										)
					),401);	//unauthorized
				}
				
				return $rows['ID'];
			break;
			default:
		}
	}
}
?>