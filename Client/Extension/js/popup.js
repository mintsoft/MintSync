/* jshint sub:true */
/** Popup specific JS in this file */
var g_currentURL = "",
	g_isFullscreen = false,
	g_injectedPort,
	g_clickedImg;

//used to parse GET variables from the current URL when opened "fullscreen"
function getParameterByName(name)
{
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.href);
	if(results === null)
		return "";
	else
		return decodeURIComponent(results[1].replace(/\+/g, " "));
}

//returns a "representative" string if str > maxlength
//returns startOfString...EndOfString 
function truncateInputAttribute(str)
{
	var maxLength=25,
		thisLength = str.length;
	if(thisLength <= maxLength)
		return str;
	else
		return str.substring(0,11) + "..." + str.substring(thisLength-11,thisLength);
}

function addCredentialPair() {
	//if it's the fullscreen popup then don't display the inject button
	if(g_isFullscreen)
	{	//using hide here causes some sort of clash with jQuery-Tools
		//and it un-hides them
		$(tmpObj).find("img.hidden_when_max").css({'display' : 'none'});
	}
	addCredentialForm.addPair();
}

//Callback for handling messages sent over the MessageChannel from InjectedJS
function handleMessageFromInjectedJS(e)
{
	console.debug("Popup received Message from Injected Script:",e);
	if(e.data.action == "inputList")
	{	
		//get the label for the clicked input
		//td:first for the retrieve page, input[name=inputPassName] for the save/generate
		//the data attribute is used because the text is now truncated to a maximum number of chars
		var valueName = $(g_clickedImg).parent().siblings("td:first").attr("data-fulltext");
		if(!valueName)	//save/generate tab!
			valueName = $(g_clickedImg).parent().siblings("input[name=inputPassName]").val();
				
		//display lightbox for the user to decide where its going into
		lightboxes.chooseInputForInject(e.data.inputs, valueName, function(input, doNext, doSubmit){
		
			var injectedValue = $(g_clickedImg).parent().parent().find("input.injectValueSourceElement").val();
			
			sendMessageToInjectedJS({
				'action'	: "injectValue",
				'src'		: 'popup',
				'target'	: {
					'name'		: input.name,
					'id'		: input.id,
					'value'		: injectedValue,
					'doSubmit'	: doSubmit,
					}
			});
			injectedValue = "";

			if(doNext){	//Popup the injection dialog for the next one too!
				$(g_clickedImg).parent().parent().next().find("img.injectPW").click();
			}
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

/** jQuery Entry Point **/
// runs before window.load();
$(document).ready(function(){
	$(document).autoBars(function() {
		var saveFormMarkup = $.handlebarTemplates['saveForm']({});
		$("#save").html(saveFormMarkup);
		
		addPopupEventHandlers();
	
		//detect fullscreen popup 
		if(getParameterByName("fullscreen"))
			g_isFullscreen = true;
		
		lightboxes.setupLightboxes();
		
		$("#tabBar").tabs("#tabContent > fieldset");
		
		//create a credentials box by default:
		addCredentialPair();
		addCredentialPair();
		$("input[name='inputPassName']").eq(0).val("Username");
		$("input[name='inputPassName']").eq(1).val("Password");
		
		
		//Add keyboard shortcut for add
		$(document).keyup(function(e) {
			if(e.which == 17)
				g_ctrlDown = false;
		}).keydown(function(e) {
			if(e.which == 17)
				g_ctrlDown=true;
			else if(g_ctrlDown === true && e.which == 68) {		//ctrl+d
				event.preventDefault();
				addCredentialPair();
				return false;
			}
		});
		
		//check if the notify icon is on and trigger a request
		//for the login details
		if($MS.getNotify() && !$MS.checkForSavedAuth())
		{
			//ask for it then
			console.info("Requesting Login Credentials");
			$MS.getAuthenticationObject(function(){
				//retrigger a cache update if enabled
				if($MP.get("Notify") == "1"  && $MP.get("NotifySource") == "cache")
				{
					stubFunctions.genericPostMessage({
						'action': 'startLocalCache',
						'src' : 'options',
					});
				}
				runPopupInit();
			});
		} else {
			runPopupInit();
		}
	});
});


function runPopupInit() {
	//if running as a standard popup
	if(!g_isFullscreen)
	{
		stubFunctions.genericRetrieve_currentTab(function(currentTab){	
			if(!currentTab)
				return;
			document.getElementById("domainInput").value = currentTab.url;
			document.getElementById("domainName").value = currentTab.url;
			g_currentURL = currentTab.url;
			
			//if the user has selected the autofetch option:
			if($MS.getAutoFetch() == 1)
			{
				getPasswords(g_currentURL);
			}
		});
	}
	//if its a "fullscreen" window then the target URL is URIEncoded as a GET string
	else
	{
		var URL = getParameterByName("URL");
		
		$("a.hidden_when_max, img.hidden_when_max").hide(0);
		$("#fullscreen_url").text("Target: "+URL);
		console.debug("Fullscreen URL:", URL);
		document.getElementById("domainInput").value = URL;
		document.getElementById("domainName").value = URL;
		g_currentURL = URL;
	
		//if the user has selected the autofetch option:
		if($MS.getAutoFetch() == 1)
		{
			getPasswords(g_currentURL);
		}
	}
	
}

//Window onload handler
// runs AFTER jQuery(document).ready();
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
},false);

/** Global Function Handlers **/

function addPopupEventHandlers()
{
	$("#iconBar a.newTabLink").click(function(event){
		event.preventDefault();
		openNewTabFromPopup(this);
	});
	
	$("#iconBar a.popupFullScreen").click(function(event){
		event.preventDefault();
		openPopupFullScreen(this);
	});
	
	$("#passwordRetrieveForm").submit(function(event){
		event.preventDefault();
		getPasswords($("#domainInput").val());
	});
	$("#passwordSaveForm").submit(function(event){
		event.preventDefault();
		addCredentialForm.setPassword(this);
	});
	addCredentialForm.AddBindings("#addPairP");
}

/**
	Retrieve passwords for domain name
*/
function getPasswords(domainName) {
	domainName=$.trim(domainName);
	if($.trim(domainName) === "")
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
/*
				console.debug("salt",requestdata.data.Salt);
*/
				$MC.decodeAndDecrypt(requestdata.data.Credentials, requestdata.data.Salt, requestdata.data.keySlot0, requestdata.data.cryptoScheme, {
					success:function(credentialsObj){
						$("#retrieveOutput tbody").empty();
						
						//also wipe out the save dialog and remove any boxes already there
						$("#inputPassContainer img.saveBin").each(function(index,Element){
							addCredentialForm.delPair(this);
						});
						
						var counter=0;
						for(var index in credentialsObj) {
							//this is done like this to ensure that the values don't screw up the HTML
							// if they contain any special characters (<> etc)
							$("#retrieveOutput tbody").append(
								$("<tr>").append(
									$("<td>")
											.text(truncateInputAttribute(index))
											.attr("data-fulltext", index),
									$("<td>").append(
										$("<input type='password' class='retrievedPassword injectValueSourceElement' readonly='readonly' >")
											.val(credentialsObj[index])
											.dblclick(function(event) {
												//when the fields are double clicked, hilight individual characters
												event.preventDefault();
												
											})
											.focus(function(event) {
												revealPassword(this);
											})
											.blur(function(event){
												rehidePassword(this);
											})
										),
									$("<td>").append(
										$("<img src='img/document_import.png' alt='Insert Password' class='jsAction injectPW hidden_when_max' />")
											.click(function(event){
												injectPass(this);
											})
									)
								)
							);
							//also add this into the save dialog for easy updates
							addCredentialPair();
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
	Open the popup in a new tab
*/
function openPopupFullScreen(thisA)
{
	urlData = $.param({
			'fullscreen': '1',
			'URL': g_currentURL
		});
		
	window.open(thisA.href+"?"+urlData,"Mintsync Popup - Fullscreen");
	
	return false;
}

/**
	Opens an A tag's href fullscreen
*/
function openNewTabFromPopup(thisA)
{
	window.open(thisA.href,"Mintsync Popup - Fullscreen");
	
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
	//for the response see handling in handleMessageFromInjectedJS
}