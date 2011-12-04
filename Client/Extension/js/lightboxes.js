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
				<div id='InputChooserTableContainer' ></div>\
				<p class='centeredContents'><input type='hidden' id='IC_closedDialog' value='0' />\
					<input type='submit' value='OK' class='close' /> <input type='submit' value='Close' class='close' id='IC_closeButton' />\
				</p>\
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
	$("#IC_closedDialog").val("0");
	$("#InputChooserTableContainer").html("<table>\
		<thead>\
			<tr>\
				<th>ID</th>\
				<th>Name</th>\
				<th>Label Text</th>\
				<th>Type</th>\
			</tr>\
		</thead>\
		<tbody>\
			<tr><td><select id='IC_ID' /></td><td><select id='IC_name' /></td><td><select id='IC_LabelText' /></td><td><select id='IC_Type' /></td></tr>\
		</tbody>\
		</table>");
	
	$("#IC_closeButton").click(function(){
		$("#IC_closedDialog").val("1");
	});
	
	$("#IC_ID, #IC_name, #IC_LabelText, #IC_Type").change(function(){
		var selectedVal = $(this).find("option:selected").val();

		$("#IC_ID").find("option[value='"+selectedVal+"']").attr('selected','selected');
		$("#IC_name").find("option[value='"+selectedVal+"']").attr('selected','selected');
		$("#IC_LabelText").find("option[value='"+selectedVal+"']").attr('selected','selected');
		$("#IC_Type").find("option[value='"+selectedVal+"']").attr('selected','selected');
		
	});
	for(var x in inputs)
	{
		$("#IC_ID").append(
			$("<option>")
				.val(x)
				.text(inputs[x].id)
		);
		$("#IC_name").append(
			$("<option>")
				.val(x)
				.text(inputs[x].name)
		);
		$("#IC_LabelText").append(
			$("<option>")
				.val(x)
				.text(inputs[x].labelText)
		);
		$("#IC_Type").append(
			$("<option>")
				.val(x)
				.text(inputs[x].type)
		);
		
	}
	$("#InputChooserPrompt").data("overlay").load().onClose(function(event){
		if($("#IC_closedDialog").val()=="0")	//if OK was clicked
		{
			//get the selected item
			var selectedIndex = $("#IC_ID option:selected").val();
			completeCallback(inputs[selectedIndex]);
		}
	});
}