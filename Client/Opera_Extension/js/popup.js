/** Popup specific JS in this file */
//is the control key down?
var ctrlDown = false;

//insert the currently selected tab into the box by default

window.addEventListener("load", function() {
	if(!opera.extension)
		return;
		
	opera.extension.onmessage = function(event) {
		var data = event.data;
		switch (data.action) {
			case "click":
				document.getElementById("domainInput").value = data.url;
				document.getElementById("domainName").value = data.url;
				
				if($MS.getAutoFetch()==1)
				{
					getPasswords(data.url);
				}
			break;
			default:
			break;
		}
	}
	
},false);


/** jQuery Entry Point **/
$(document).ready(function(){

	$("#tabBar").tabs("#tabContent > fieldset");
	
	//create a credentials box by default:
	addPair();
	addPair();
	$("input[name='inputPassName']").eq(0).val("Username");
	$("input[name='inputPassName']").eq(1).val("Password");
});

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
	var passwordLength = 16; 		//TODO: get this from preferences
	$(tmpObj).find("input[name='inputPassValue']").mousedown(function(event){
		if(event.which == 3 && $(this).val()=="" ) 	//right click
		{
			event.preventDefault();
			$(this).val($MS.generatePassword(passwordLength));
			return false;
		}
		return true;
	}).keyup(function(e) {
		if(e.which == 17)
			ctrlDown = false;
	}).keydown(function(e) {
		if(e.which == 17)
			ctrlDown=true;
		else if(ctrlDown == true && e.which == 71) {		//ctrl+g
			event.preventDefault();
			$(this).val($MS.generatePassword(passwordLength));
			return false;
		}
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
	domainName=$.trim(domainName);
	if($.trim(domainName)=="")
	{
		$("#fetchErrorDiv").text("No URL entered, try refreshing the tab");
		return;
	}
	
	//clear the error text
	$("#fetchErrorDiv").text("");
	$MS.getPasswords(domainName, {
		beforeSend: function(){
			$("#fetchDiv").hide(0);
			$("#loadingDiv").show(0);
		},
		complete: function(){
			$("#loadingDiv").hide(0);
			$("#fetchDiv").show(0);
		},
		success : function(requestdata){
			var outputStr = "",
				decryptedJSON = "",
				key = "",
				base64decoded="",
				innerHTML="";

				credentialsObj = $MC.decodeAndDecrypt(requestdata.data.Credentials, requestdata.data.Salt)
				$("#retrieveOutput tbody").empty();
				for(var index in credentialsObj) {
					//this is done like this to ensure that the values don't screw up the HTML
					// if they contain any special characters (<> etc)
					$("#retrieveOutput tbody").append(
						$("<tr>").append(
							$("<td>").text(index),
							$("<td>").append(
								$("<input type='password' onfocus='revealPassword(this);' readonly='readonly' onblur='rehidePassword(this);'>").val(credentialsObj[index])
							)
						)
					);
				}
				$("#retrieveOutput").show(0);
		},
		error: function(jq,textStatus,errorThrown){
			if(jq.status==404)	//no password!
			{
				$("#fetchErrorDiv").text("No credentials were found for this URL");
			}
			else
			{
				$("#fetchErrorDiv").text("An undefined error has occurred, see the error console for more information");
				console.log("An Error Occurred:" + textStatus + "\n" + errorThrown+"\n"+jq.responseText);
			}
		}
	});
}

/**
	Send Credentials Data for Domain
*/
function setPassword() {
	var domainName=$.trim($("#domainName").val()),
		RowSalt = $MS.generateRowSalt(),
		encryptedData = "",
		CredentialsObj = new Object(),
		force = false;
	
	//build JS Object to JSON
	$("#inputPassContainer").children("p").each(function(index,Element){
		var name = "", password="";
		
		name 		= $(this).children("input[name='inputPassName']").val(); 
		password 	= $(this).children("input[name='inputPassValue']").val();
		
		CredentialsObj[name]=password;
	});
	
	encryptedData = $MC.encodeAndEncrypt(CredentialsObj,RowSalt);
	CredentialsObj = new Object();

	//check is overwrites are allowed (force)
	force = $("#canForceWrite:checked").val();
	$MS.setPassword(domainName,encryptedData,RowSalt,force,{
		error: function(jq,textStatus,errorThrown) {
			if(jq.status==409)
			{	
				$("#saveOutput").text("Save Failed: This URL Already exists");
			}
			else
			{
				$("#saveOutput").text("An undefined error has occurred, see the error console for more information");
				console.log("An Error Occurred:" + textStatus + "\n" + errorThrown+"\n"+jq.responseText);
			}
		},
		success: function(requestdata) {
			$("#saveOutput").text("Credentials Saved");
			//uncheck the overwrite box
			$("#canForceWrite").attr("checked",false);
		},
		zzz: function(){}
	});
}
