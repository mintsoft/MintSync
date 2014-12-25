/** JS used on the password changer page **/

/** jQuery entry point */
$(document).ready(function() {
	
	lightboxes.setupLightboxes();
	
});

/**
	creates a SHA hash
*/
function doHash(passwd,type)
{
	var shaObj = new jsSHA(passwd, "ASCII");
	return shaObj.getHash(type, "HEX");
}


/**
	Change the crypto password
*/
function changePassword() {

	if($("#newPassword1").val()==="" || $("#newPassword2").val()==="" || $("#currentPassword").val()==="")
	{
		alert("Error: all fields must be completed");
		return false;
	}
	
	if($("#newPassword1").val() !== $("#newPassword2").val())
	{
		alert("Error: new passwords do not match");
		return false;
	}
	
	//retrieveKeySlot0
	$MS.getKeySlot({
		beforeSend: function(jq,settings) {
		//	console.info(jq);
		},
		complete: function(jq,textStatus) {
		//	console.log(jq);
		},
		success: function(data,textStatus,jq) {
			
			//verify keySlot0PassHash first
			
			//hash the entered password
			masterKey			= doHash($("#currentPassword").val(),"SHA-512");
			oldKeySlot0PassHash	= doHash(masterKey,"SHA-512");

			if(oldKeySlot0PassHash!==data.data.keySlot0PassHash)
			{
				alert("Error: the entered encryption password is not correct.");
				return false;
			}
			
			//old key
			oldKeySlot0CryptoKey = $MC.Hex2Str(doHash(masterKey,"SHA-256"));
			
			//new key - form SHA256 encryption key from the new password
			newKeySlot0CryptoKey = $MC.Hex2Str(doHash(doHash($("#newPassword1").val(),"SHA-512"),"SHA-256"));	
			newKeySlot0PassHash = doHash(doHash($("#newPassword1").val(),"SHA-512"),"SHA-512");	
			
			//decrypt keySlot0
			rawKey = $MC.Decrypt_strings(data.data.keySlot0,oldKeySlot0CryptoKey,"AES",256);
			
			//recrypt with new password
			newKeySlot0 = $MC.Encrypt_strings(rawKey,newKeySlot0CryptoKey,"AES",256);
			rawkey = "";
			
			//send newKeySlot0 to the Server with the newCryptopasswdVerifyHash
			$MS.setKeySlot(newKeySlot0, newKeySlot0PassHash, {
				beforeSend: function(jq,settings) {
				//	console.info(jq);
				},
				complete: function(jq,textStatus) {
				//	console.log(jq);
				},
				success: function(data,textStatus,jq) {
					alert("Password change was successful");
				},
				error: function(jq,textStatus,errorThrown) {
					alert("A fatal error has occurred (" + errorThrown + "), check the error log for more information");
					console.error(jq,textStatus,errorThrown);
				}
			});
		},
		error: function(jq,textStatus,errorThrown) {
			switch(jq.status)
			{
				case 401:
					alert("Incorrect credentials, please try again");
				break;
				default:
					alert("A fatal error has occurred (" + errorThrown + "), check the error log for more information");
					console.error(jq,textStatus,errorThrown);
			}
		}
	});
	//updateKeySlot0
	
}