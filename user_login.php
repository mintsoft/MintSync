<?php

/**
 * Class to encapsulate all things user login-y
 */
class user_login
{

	/**
	 * Retieve row for user
	 * @param string $username Username
	 * @return array
	 */
	public static function getUserRow($username)
	{

		$db = new PDO(PDO_DSN);
		$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

		$stmt = $db->prepare("SELECT * FROM user WHERE username=:username;");
		$stmt->bindValue(":username", $username);
		$stmt->execute();

		$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

		return(isset($rows[0]) ? $rows[0] : null);
	}

	/**
	 * Validates the a user by the authorisation header
	 * @return integer
	 */
	public static function validate()
	{
		$restTools = new restTools();
		$headers = apache_request_headers();
		$authorisation_header = empty($headers['X-MS-Authorisation']) ? $_SERVER['HTTP_X_MS_AUTHORISATION'] : $headers['X-MS-Authorisation'];
		if(empty($authorisation_header))
		{
			$restTools->sendResponse(array(
						"status" => "fail",
						"data" => array(
							"reason" => "Authentication Error; X-MS-Authorisation headers must be provided"
						)
							), 403);
		}
		list($method, $authHeader) = explode(" ", $authorisation_header);

		switch ($method)
		{
			case "MintSync1":

				list($username, $rowSalt, $authString) = explode("|", $authHeader);

				$rows = user_login::getUserRow($username);
				$passhash = $rows['password'];

				$srcString = "{$passhash}:{$rowSalt}";
				$ourAuthStr = base64_encode(hash("sha512", $srcString, true));
				if ($ourAuthStr !== $authString)
				{
					$restTools->sendResponse(array(
						"status" => "fail",
						"data" => array(
							"reason" => "Authentication Error"
						)
							), 401);
				}

				return $rows['ID'];
			break;
			default:
		}
	}

}

?>
