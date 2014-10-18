<?php
require_once 'server_components.php';
$db = new PDO(PDO_DSN);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$dbSchema = new schema_version($db);
$dbSchema->checkAndMigrate();

?>