<?php 

require_once 'config.php';

$db = new PDO('sqlite:'.PASSWORD_DATABASE);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$stmt = $db->prepare("SELECT * FROM auth");
$stmt->execute();

$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "<pre>";
var_dump($rows);
echo "</pre>";
?>