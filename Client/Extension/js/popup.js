/** Popup specific JS in this file */
//is the control key down?
var g_ctrlDown = false,
	g_currentURL ="",
	g_isFullscreen = false,
	g_injectedPort,
	g_clickedImg;

//used to parse GET variables from the current URL when opened "fullscreen"
function getParameterByName(name)
{
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.href);
  if(results == null)
    return "";
  else
    return decodeURIComponent(results[1].replace(/\+/g, " "));
}

//Callback for handling messages sent over the MessageChannel from InjectedJS
function handleMessageFromInjectedJS(e)
{
	console.debug("Popup received Message from Injected Script:",e)
	if(e.data.action == "inputList")
	{	
		//get the label for the clicked input
		var valueName = $(g_clickedImg).parent().siblings("td:first").text();
	
		//display lightbox for the user to decide where its going into
		chooseInputForInject(e.data.inputs, valueName, function(input){
		
			var injectedValue = $(g_clickedImg).parent().siblings().children("input").val();
		
			sendMessageToInjectedJS({
				'action'	: "injectValue",
				'src'		: 'popup',
				'target'	: {
					'name'	:	input.name,
					'id'	:	input.id,
					'value'	:	injectedValue,
					}
			});
			injectedValue = "";
		});
		
	}
}

//Use configured messageChannel to send a message to the InjectedJS
function sendMessageToInjectedJS(message)
{
	var sendStr = message;
	if(g_injectedPort)
	{
		g_injectedPort.postMessage(sendStr);
	}
	else
	{
		console.error("MessageChannel not yet configured, message not sent", message);
	}
}

//insert the currently selected tab into the box by default
window.addEventListener('load', function() {
	if(!opera.extension)
		return;
	
	//if it has been clicked, then the message will contain the URL etc
	opera.extension.onmessage = function(event) {
		if (event.data == "popupConnect")
		{
			if(event.ports.length > 0)
			{
				g_injectedPort = event.ports[0];
				g_injectedPort.onmessage = handleMessageFromInjectedJS;
			}
		}	
	};
	
	//if running as a standard popup
	if(!getParameterByName("fullscreen"))
	{
		var currentTab = opera.extension.bgProcess.opera.extension.tabs.getFocused();
		document.getElementById("domainInput").value = currentTab.url;
		document.getElementById("domainName").value = currentTab.url;
		g_currentURL = currentTab.url;
	}
	//if its a "fullscreen" window then the target URL is URIEncoded as a GET string
	else
	{
		var URL = getParameterByName("URL");
		
		g_isFullscreen = true;
		$("a.hidden_when_max, img.hidden_when_max").hide(0);
		$("#fullscreen_url").text("Target: "+URL);
		console.debug("Fullscreen URL:", URL);
		document.getElementById("domainInput").value = URL;
		document.getElementById("domainName").value = URL;
	}
	
	
},false);


/** jQuery Entry Point **/
$(document).ready(function(){

	setupLightboxes();

	$("#tabBar").tabs("#tabContent > fieldset");
	
	//create a credentials box by default:
	addPair();
	addPair();
	$("input[name='inputPassName']").eq(0).val("Username");
	$("input[name='inputPassName']").eq(1).val("Password");
	
	//check if the notify icon is on and trigger a request
	//for the login details
	if(	typeof(opera.extension)!=="undefined" && 
		$MS.getNotify() && !$MS.checkForSavedAuth())
	{
		//ask for it then
		console.info("Requesting Login Credentials");
		$MS.getAuthenticationObject(function(){
			//retrigger a cache update if enabled
			if(widget.preferences["Notify"]=="1"  && widget.preferences["NotifySource"]=="cache")
			{
				opera.extension.postMessage({
					'action': 'startLocalCache',
					'src' : 'options',
				});
			}
		});
	}
		
	
	
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
	
	var passwordLength = $MS.getGeneratedPasswordLength();
	
	//add click handler
	//using contextmenu instead of click so that it can be cancelled on the maximised version
	$(tmpObj).find("input[name='inputPassValue']").bind("contextmenu", function(event){
		if($(this).val()=="" )
		{
			$(this).val($MS.generatePassword(passwordLength));
			event.preventDefault();
			return false;
		}
	}).keyup(function(e) {
		if(e.which == 17)
			g_ctrlDown = false;
	}).keydown(function(e) {
		if(e.which == 17)
			g_ctrlDown=true;
		else if(g_ctrlDown == true && e.which == 71) {		//ctrl+g
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

				$MC.decodeAndDecrypt(requestdata.data.Credentials, requestdata.data.Salt, requestdata.data.keySlot0, {
					success:function(credentialsObj){
						$("#retrieveOutput tbody").empty();
						
						//also wipe out the save dialog and remove any boxes already there
						$("#inputPassContainer img.saveBin").each(function(index,Element){
							delPair(this);
						});
						
						var counter=0;
						for(var index in credentialsObj) {
							//this is done like this to ensure that the values don't screw up the HTML
							// if they contain any special characters (<> etc)
							$("#retrieveOutput tbody").append(
								$("<tr>").append(
									$("<td>").text(index),
									$("<td>").append(
										$("<input type='password' class='retrievedPassword' onfocus='revealPassword(this);' readonly='readonly' onblur='rehidePassword(this);'>")
											.val(credentialsObj[index])
											.dblclick(function(event) {
												//when the fields are double clicked, hilight individual characters
												event.preventDefault();
												
										})),
									$("<td>").append(
										$("<img src='img/document_import.png' alt='Insert Password' onclick='injectPass(this); return false' class='jsAction injectPW hidden_when_max' />")
									)
								)
							);
							//also add this into the save dialog for easy updates
							addPair();
							$("#inputPassContainer input[name='inputPassName']").eq(counter).val(index);
							$("#inputPassContainer input[name='inputPassValue']").eq(counter++).val(credentialsObj[index]);
							
						}
						$("#retrieveOutput").show(0);
						
						if(g_isFullscreen)
							$("img.hidden_when_max").hide(0);
					},
					error: function(){
						alert("The password entered was incorrect, please try again");
						$MS.resetSavedCryptoPassword();
					}
				});
				
		},
		error: function(jq,textStatus,errorThrown){
			switch(jq.status)
			{
				case 401:
					$("#fetchErrorDiv").text("Incorrect Login, please try again");
				break;
				case 404: //no password
					$("#fetchErrorDiv").text("No credentials were found for this URL");
				break;
				default:
				
					$("#fetchErrorDiv").text("An undefined error has occurred, see the error console for more information");
					console.error("An Error Occurred:" + textStatus + "\n" + errorThrown+"\n"+jq.responseText);
					console.error(jq);
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
		
	if(domainName=="")
	{
		$("#saveOutput").text("Error: No URL entered, no save has occurred");
		return;
	}
	
	//build JS Object to JSONify
	$("#inputPassContainer").children("p").each(function(index,Element){
		var name = "", password="";
		
		name 		= $(this).children("input[name='inputPassName']").val(); 
		password 	= $(this).children("input[name='inputPassValue']").val();
		
		CredentialsObj[name]=password;
	});
	
	$MS.getKeySlot({
		success: function(returnedData){
			$MC.encodeAndEncrypt(CredentialsObj,RowSalt,returnedData.data.keySlot0,function(encryptedData,cryptoHash){
				CredentialsObj = new Object();
				
				//check is overwrites are allowed (force)
				force = $("#canForceWrite:checked").val();
				$MS.setPassword(domainName,encryptedData,RowSalt,cryptoHash,force,{
					error: function(jq,textStatus,errorThrown) {
						
						switch(jq.status)
						{
							case 401:
								$("#saveOutput").text("Save Failed: Incorrect Login, please try again");
							break;
							case 409:
								$("#saveOutput").text("Save Failed: This URL Already exists");
							break;
							case 417:
								$("#saveOutput").text("Save Failed: Inconsistent Crypto Password");
								//update the saved crypto password if it is set to anything other than no
								$MS.resetSavedCryptoPassword();
							break;
							default:
							
								$("#saveOutput").text("An undefined error has occurred, see the error console for more information");
								console.error("An Error Occurred:" + textStatus + "\n" + errorThrown+"\n"+jq.responseText);		
								console.error(jq);
						}
					},
					success: function(requestdata,textStatus,jq) {
						$("#saveOutput").text("Credentials Saved");
						
						//uncheck the overwrite box
						$("#canForceWrite").attr("checked",false);
						
						//update the local cache
						opera.extension.postMessage({
							'action': 'updateLocalCache',
							'src' : 'passwordMatrix',
						});
					},
					zzz: function(){}
				});
			});
		},
		error: function(jq,textStatus,errorThrown) {
		
			switch(jq.status)
			{
				case 401:
					$("#saveOutput").text("Save Failed: Incorrect Login, please try again");
				break;
				default:
					alert("Catastrophic Error Retrieving keySlot0, see the error log for more information");
					console.error("An Error Occured Retrieving keySlot0: "+textStatus);
					console.error(jq);
					console.error(errorThrown);
					console.error("##########################################");
			}
		}
	});
}

/**
	Open the popup in a new tab
*/
function openPopupFullScreen(thisA)
{
	urlData = $.param({
			'fullscreen': '1',
			'URL': g_currentURL
		});
	opera.extension.bgProcess.opera.extension.tabs.create({
			url: thisA.href+"?"+urlData, 
			focused: true
		}); 
	return false;
}

/**
	Opens an A tag's href fullscreen
*/
function openNewTabFromPopup(thisA)
{
	/*
		onclick='window.open(window.location,"Mintsync Popup - Fullscreen"); alert(window.location); return false;'
		doesn't work so I've used opera.extension.tabs which isn't accessible directly so one has to go via the
		background process
	*/
	
	opera.extension.bgProcess.opera.extension.tabs.create({
		url: thisA.href, 
		focused: true
	}); 
	return false;
}

/**
	Input for the password insert/injection script
	from the thisImg that was clicked
*/
function injectPass(thisImg)
{
	//NOT good practise but it'll do for now
	g_clickedImg = thisImg;
	sendMessageToInjectedJS({
		'action'	: "requestInputList",
		'src'		: 'popup',
	});
}