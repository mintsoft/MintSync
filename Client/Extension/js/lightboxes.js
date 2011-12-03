/** 
Initialise the lightboxes
*/

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
	
	//input tag selector for value injection
	$("body").append("<div class='modalDialog' id='InputChooserPrompt'>\
			<h2 id='InputChooserInstruction'>Select the correct input tag</h2>\
			<form onsubmit='return false;'>\
				<select id='InputChooserTarget'></select>\
				<p class='centeredContents'><input type='submit' value='OK' class='close'></p>\
			</form>\
		</div>");
		
	$(".modalDialog").overlay({

		// some mask tweaks suitable for modal dialogs
		mask: {
			color: '#000',
			loadSpeed: 0,
			closeSpeed: 0,
			opacity: 0.7,
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
	$("#passwordPrompt").data("overlay").load().onClose(function(event){
		completeCallback($("#dialogPassPassword").val());
		$(this).unbind(event);
	});
	$("#dialogPassPassword").focus();
	
}
/**
	Substitute for Prompt used for authentication (un/pass)
*/
function askForUsernamePassword(prompt,completeCallback)
{
	$("#dialogAuthUsername").val("");
	$("#dialogAuthPassword").val("");
	$("#authenticationPrompt").data("overlay").load().onClose(function(event){
		completeCallback({
			'username': $("#dialogAuthUsername").val(),
			'password':	$("#dialogAuthPassword").val()
		});
		$(this).unbind(event);
	});
	$("#dialogAuthUsername").focus();
}

/**
	Select the correct input box to inject the values into!
 */
function chooseInputForInject(inputs, completeCallback)
{
	$("#InputChooserTarget").html("");
	for(var x in inputs)
	{
		$("#InputChooserTarget").append(
			$("<option>")
				.val(x)
				.text("Label: '"+inputs[x].labelText+"', ID: '"+inputs[x].id+"', Name: '"+inputs[x].name+"'")
		);
	}
	$("#InputChooserPrompt").data("overlay").load().onClose(function(event){
		//get the selected item
		var selectedIndex = $("#InputChooserTarget option:selected").val();
		completeCallback(inputs[selectedIndex]);
	});
}