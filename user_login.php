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
	 * @return type
	 */
	public static function validate()
	{

		$headers = apache_request_headers();

		list($method, $authHeader) = explode(" ", $headers['X-MS-Authorisation']);

		switch ($method)
		{
			case "MintSync1":

				list($username, $rowSalt, $authString) = explode("|", $authHeader);

				$rows = user_login::getUserRow($username);
				$passhash = $rows['password'];

				$srcString = "{$passhash}:{$rowSalt}";
				$ourAuthStr = base64_encode(hash("sha512", $srcString, true));
				$restTools = new restTools();
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