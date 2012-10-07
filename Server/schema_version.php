<?php
/*
	Holds methods for checking the schema version of the server and migrating the database on demand if required.
*/

class schema_version {
	private $db;
	function __construct($pdo)
	{
		$this->db = $pdo;
	}
	
	public function checkAndMigrate()
	{
		$maxVer = $this->retrieveCurrentSchemaVersion();
		if($maxVer < 0) 	//replace 0 with dynamically retrieved migration count
			$this->doMigration();
	}
	
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
	public function doMigration()
	{
	}
}
?>