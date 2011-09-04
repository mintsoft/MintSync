function setupLightboxes()
{
	//add the ask for a password box
	$("body").append("<div class='modalDialog' id='passwordPrompt'>\
			<h2 id='dialogPasswordInstruction'>Enter your password</h2>\
			<form onsubmit='return false;'>\
				<p><input name='dialogPassPassword' id='dialogPassPassword'type='password' value='' required /></p>\
				<p class='centeredContents'><input type='submit' class='close'></p>\
			</form>\
		</div>");
	
	//user login box
	$("body").append("<div class='modalDialog' id='authenticationPrompt'>\
			<h2 id='authenticationInstruction'>Enter your username and password</h2>\
			<form onsubmit='return false;'>\
				<p><label for='dialogAuthUsername'>Username</label><input name='dialogAuthUsername' id='dialogAuthUsername' type='text' value='' placeholder='Username' required /></p>\
				<p><label for='dialogAuthPassword'>Password</label><input name='dialogAuthPassword' id='dialogAuthPassword' type='password' value='' required /></p>\
				<p class='centeredContents'><input type='submit' class='close'></p>\
			</form>\
		</div>");	
		
		
	$(".modalDialog").overlay({

		// some mask tweaks suitable for modal dialogs
		mask: {
			color: '#000',
			loadSpeed: 'fast',
			opacity: 0.7
		},
		top: 'center',
		closeOnClick: false,
		closeOnEsc: false,
		load: false,
		speed: 'fast'
	});	
}
/**
	Substitute for Prompt, used for passwords
*/
function askForPassword(prompt,completeCallback)
{
	$("#dialogPassPassword").val("");
	$("#dialogPasswordInstruction").text(prompt);
	$("#passwordPrompt").data("overlay").load().onClose(function(){
		completeCallback($("#dialogPassPassword").val());
	});
	$("#dialogPassPassword").focus();
	
}
/**
	Substitute for Prompt used for authentication (un/pass)
*/
function askForUsernamePassword(prompt,completeCallback)
{
//	$("#authenticationInstruction").text(prompt);
	$("#dialogAuthUsername").val("");
	$("#dialogAuthPassword").val("");
	$("#authenticationPrompt").data("overlay").load().onClose(function(){;
		completeCallback({
			'username': $("#dialogAuthUsername").val(),
			'password':	$("#dialogAuthPassword").val()
		});
	});
	$("#dialogAuthUsername").focus();
}