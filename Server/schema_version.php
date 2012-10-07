<?php
/**
 * Holds methods for checking the schema version of the server and migrating the database on demand if required.
 */

class schema_version {
	private $db;
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
		$maxVer = $this->retrieveCurrentSchemaVersion();
		if($maxVer < 0) 	//replace 0 with dynamically retrieved migration count
			return $this->doMigration();
        return false;
	}
	
    /**
     * Returns the current schema version from the schema_version table,
     * if the table does not exist, will create it an intialise to version 0
     * @return integer
     */
	public function retrieveCurrentSchemaVersion()
	{
		//check if table exists
		$stmt = $this->db->prepare("SELECT COUNT(*) AS doesExist FROM sqlite_master WHERE type='table' AND name='schema_version';");
		$stmt->execute();
		$resultSet = $stmt->fetchAll();
		
		//if not then create it and initialise to version 0
		if( $resultSet[0]['doesExist'] == 0 )
		{
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
	public function doMigration()
	{
		return true;
	}
}
?>