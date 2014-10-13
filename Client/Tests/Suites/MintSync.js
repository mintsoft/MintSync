module("MintSync");

// $MS.getPasswords = function(Domain, callbacks) 
// $MS.getPasswordsByID = function(IDnum, callbacks) 
// $MS.checkIfPasswordsExist = function(Domain,callbacks) 
// $MS.listURLS = function(callbacks) 
// $MS.setPassword = function(Domain,Credentials,rowSalt,cryptoHash,force,callbacks) 
// $MS.removePasswords = function(ID,url,callbacks) 
// $MS.renameURL = function(ID,newDomain,callbacks) 
// $MS.verifyCryptoPass = function(passwordHash,callbacks) 
// $MS.getKeySlot = function(callbacks) 
// $MS.setKeySlot = function(newKeySlot, newKeySlot0PassHash, callbacks) 
// $MS.configureAuth = function(jqXHR,settings,AuthObject) 
// $MS.hashPass = function(passwd) 
// $MS.getEncryptionPasswordHash = function(successCallback) 
// $MS.checkForSavedAuth = function() 
// $MS.getAuthenticationObject = function(authCallback) 
// $MS.resetSavedCredentials = function() 
// $MS.resetSavedCryptoPassword = function() 
// $MS.getAutoFetch = function() 
// $MS.getNotify = function() 
// $MS.getServerURL = function() 
// $MS.getGeneratedPasswordLength = function() 
// $MS.getGeneratedRowSaltLength = function() 
// $MS.generateRowSalt = function() 

// $MS.generatePassword = function(length) 
test("$MS.generatePassword generates a valid password", function(){
	ok($MS.generatePassword(16).match(/^.{16}$/));
});