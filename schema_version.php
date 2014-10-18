<?php

/**
 * Holds methods for checking the schema version of the server and migrating the database on demand if required.
 */
class schema_version
{
	private $db;

	/**
	 * @param $pdo PDO Database Object
	 */
	function __construct($pdo)
	{
		$this->db = $pdo;
	}

	/**
	 * Checks if any migrations are due against this schema and performs them
	 * if necessary
	 * @return boolean
	 */
	public function checkAndMigrate()
	{
		$dh = @opendir(MIGRATIONS_DIRECTORY);
		if(!$dh)
			return false;

		$maxMigration = 0;
		while(($filename = readdir($dh)) !== false) {
			$matches = array();
			if(preg_match("/^([1-9][0-9]*)\.sql$/", $filename, $matches)) {
				if($maxMigration < $matches[1])
					$maxMigration = (int)$matches[1];
			}
		}
		@closedir($dh);

		$maxVer = $this->retrieveCurrentSchemaVersion();

		if($maxVer < $maxMigration)
			return $this->doMigrations();

		return false;
	}

	/**
	 * Returns whether or not the table exists
	 */
	private function tableExists($tableName)
	{
		//check if table exists
		$stmt = $this->db->prepare("SELECT COUNT(*) AS doesExist FROM sqlite_master WHERE type='table' AND name=?;");
		$stmt->execute(array($tableName));
		$resultSet = $stmt->fetchAll();
		return $resultSet[0]['doesExist'] != 0;
	}

	/**
	 * Returns the current schema version from the schema_version table,
	 * if the table does not exist, will create it an intialise to version 0
	 * @return integer
	 */
	public function retrieveCurrentSchemaVersion()
	{
		//if not then create it and initialise to version 0
		if(!$this->tableExists("schema_version")) {
			$this->db->exec("CREATE TABLE schema_version(versionNo INTEGER PRIMARY KEY);");
			$this->db->exec("INSERT INTO schema_version(versionNo) VALUES(0);");
		}

		//return the current migration number
		$stmt = $this->db->prepare("SELECT MAX(versionNo) AS currentVersion FROM schema_version;");
		$stmt->execute();
		$resultSet = $stmt->fetchAll();
		return $resultSet[0]['currentVersion'];
	}
	
	/**
	 * Will perform migrations on the database from a source
	 * TODO: Implement and decide on structure
	 * @return boolean
	 */
	public function doMigrations()
	{
		return true;
	}

}

?>