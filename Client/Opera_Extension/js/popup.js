/** Popup specific JS in this file */

//insert the currently selected tab into the box by default

window.addEventListener("load", function() {
	if(!opera.extension)
		return;
		
	opera.extension.onmessage = function(event) {
		document.getElementById("domainInput").value = event.data;
		document.getElementById("domainName").value = event.data;
		
		if($MS.getAutoFetch()==1)
		{
			getPasswords(event.data);
		}
	}
	
},false);

/** Global Function Handlers **/

/** 
	Adds a new input pair to the popup and defines the click handlers
*/

function addPair() 
{
	var target	= document.getElementById("inputPassContainer"),
		source	= document.getElementById("rowTemplate"),
		tmpObj;
	
	tmpObj = document.createElement(source.firstElementChild.tagName);
	tmpObj.innerHTML = source.firstElementChild.innerHTML;
	
	target.appendChild(tmpObj);
	
	//add click handler
	$(tmpObj).find("input[name='inputPassValue']").mousedown(function(event){
		var passwordLength = 16; 		//TODO: get this from preferences

		if(event.which == 3 && $(this).val()=="" ) 	//right click
		{
			$(this).val($MS.generatePassword(passwordLength));
			return false;
		}
		return true;
	});
}

/**
	Deletes the pair from the passed element
*/
function delPair(fromHere)
{
	fromHere.parentNode.parentNode.removeChild(fromHere.parentNode);
}


/**
	Retrieve passwords for domain name
*/
function getPasswords(domainName) {
	$MS.getPasswords(domainName, function(data){
		var outputStr = "",
			decryptedJSON = "",
			key = "",
			base64decoded="",
			innerHTML="";
		
//		outputStr = "Received From Webserver:\n"+data+"\n\n";
		
		parsedObject = $.parseJSON(data);
		switch(parsedObject.status)
		{
			case "ok":
			
				base64decoded = base64_decode(parsedObject.data.Credentials);
				passwordHash = $MS.getPasswordHash();
			
				key = passwordHash+""+parsedObject.data.Salt;

				decryptedJSON = $MC.Decrypt_strings(base64decoded,key,"AES",256);
				
				//outputStr+= "Decrypted Credentials:\n"+decryptedJSON+"\n";
				
				$("#retrieveOutput tbody").html("");
				
				//create table containing credentials
				credentialsObj = $.parseJSON(decryptedJSON);
				
				for(var index in credentialsObj) {
					//this is done like this to ensure that the values don't screw up the HTML
					// if they contain any special characters (<> etc)
					$("#retrieveOutput tbody").append(
						$("<tr>").append(
							$("<td>").text(index),
							$("<td>").append(
								$("<input type='password' onfocus='revealPassword(this);' onblur='rehidePassword(this);'>").val(credentialsObj[index])
							)
						)
					);
				}
				$("#retrieveOutput").show(0);
				
			break;
			case "not-found":
			
				outputStr = "URL not found.";
				
			break;
			case "failed":
			
				outputStr = "Error, Retrieval Failed.";
				
			break;
			default:
			
		}
		//$('#preoutput').text(outputStr);
	});
}

/**
	Send Credentials Data for Domain
*/
function setPassword() {
	var domainName=$("#domainName").val(),
		RowSalt = $MS.generateRowSalt(),
		encryptedData = "",
		encryptionKey = "",
		CredentialsObj = new Object(),
		Credentials = "",
		passwordHash = $MS.getPasswordHash(),
		force = false;
	
	//build JS Object to JSON
	$("#inputPassContainer").children("p").each(function(index,Element){
		var name = "", password="";
		
		name 		= $(this).children("input[name='inputPassName']").val(); 
		password 	= $(this).children("input[name='inputPassValue']").val();
		
		CredentialsObj[name]=password;
	});
	
	//Generate JSON String
	Credentials = JSON.stringify(CredentialsObj);

	encryptionKey = passwordHash+""+RowSalt;
	encryptedData = base64_encode($MC.Encrypt_strings(Credentials,encryptionKey,"AES",256));
	
	Credentials = "";
	CredentialsObj = new Object();
	
	//check is overwrites are allowed (force)
	force = $("#canForceWrite:checked").val();
	$MS.setPassword(domainName,encryptedData,RowSalt,force);
}

/* Reveals the password selected */
function revealPassword(thisOne)
{
	thisOne.type="text";
}
/* hides the password selected */
function rehidePassword(thisOne)
{
	thisOne.type="password";
}

/** jQuery Entry Point **/
$(document).ready(function(){

	$("#tabBar").tabs("#tabContent > fieldset");
	
	//create a credentials box by default:
	addPair();
	
});