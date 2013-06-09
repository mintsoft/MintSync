/** 
Initialise the lightboxes
*/

function setupLightboxes()
{
	//add the ask for a password box
	$("body").append("<div class='modalDialog' id='passwordPrompt'>\
			<h2 id='dialogPasswordInstruction'>Enter your password</h2>\
			<form novalidate>\
				<p><input name='dialogPassPassword' id='dialogPassPassword'type='password' value='' required /></p>\
				<p class='centeredContents'><input type='submit' class='close'></p>\
			</form>\
		</div>");
	
	//user login box
	$("body").append("<div class='modalDialog' id='authenticationPrompt'>\
			<h2 id='authenticationInstruction'>Enter your username and password</h2>\
			<form novalidate>\
				<p><label for='dialogAuthUsername'>Username</label><input name='dialogAuthUsername' id='dialogAuthUsername' type='text' value='' placeholder='Username' required /></p>\
				<p><label for='dialogAuthPassword'>Password</label><input name='dialogAuthPassword' id='dialogAuthPassword' type='password' value='' required /></p>\
				<p class='centeredContents'><input type='submit' class='close'></p>\
			</form>\
		</div>");	
	
	//input tag selector for value injection
	$("body").append("<div class='modalDialog' id='InputChooserPrompt'>\
			<h2 id='InputChooserInstruction'>Select the correct input tag using the properties below:</h2>\
			<form novalidate>\
				<div id='InputChooserTableContainer' ></div>\
				<p class='centeredContents'><input type='hidden' id='IC_closedDialogState' value='0' />\
					<input type='submit' value='OK' class='close' /> \
					<input type='submit' value='OK + Next' class='close' id='IC_OKNextButton' /> \
					<input type='submit' value='OK + Submit' class='close' id='IC_OKSubmitButton' /> \
					<input type='submit' value='Close' class='close' id='IC_closeButton' />\
				</p>\
			</form>\
		</div>");
	
	//add onsubmit handlers to do nothing
	$("#passwordPrompt form, #authenticationPrompt form, #InputChooserPrompt form").submit(function(event){
		event.preventDefault();
		return false;
	});
	
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
function chooseInputForInject(inputs, valueName, completeCallback)
{
	$("#IC_closedDialogState").val("1");	//OK

	$("#InputChooserTableContainer").html("<table>\
		<thead>\
			<tr>\
				<th>Property</th><th>Value</th>\
			</tr>\
		</thead>\
		<tfoot>\
			<tr>\
				<td colspan='2' class='rightAligned'><a href='#' id='IC_ExpandLink'>Expand</a></td>\
			</tr>\
		</tfoot>\
		<tbody>\
			<tr>	<td>Label Text</td><td class='rightAligned' ><select id='IC_LabelText' /></td>	</tr>\
			<tr class='expanded'>	<td>ID</td><td class='rightAligned' ><select id='IC_ID' /></td>	</tr>\
			<tr class='expanded'>	<td>Name</td><td class='rightAligned' ><select id='IC_name' /></td>	</tr>\
			<tr class='expanded'>	<td>Type</td><td class='rightAligned' ><select id='IC_Type' /></td>	</tr>\
		</tbody>\
		</table>");
	
	$("#IC_closeButton").one('click', function(){
		$("#IC_closedDialogState").val("0");	//Close
	});
	
	$("#IC_OKNextButton").one('click',function(){
		$("#IC_closedDialogState").val("2");	//Close+Next
	});
	$("#IC_OKSubmitButton").one('click',function(){
		$("#IC_closedDialogState").val("3");	//Close+Next
	});
	$("#IC_ExpandLink").one('click' ,function(event){
		event.preventDefault();
		$(".expanded").show();
		$("#IC_ExpandLink").parent().hide();
		return false;
	});
	
	$("#IC_ID, #IC_name, #IC_LabelText, #IC_Type").change(function(){
		var selectedVal = $(this).find("option:selected").val();

		$("#IC_ID").find("option[value='"+selectedVal+"']").attr('selected','selected');
		$("#IC_name").find("option[value='"+selectedVal+"']").attr('selected','selected');
		$("#IC_LabelText").find("option[value='"+selectedVal+"']").attr('selected','selected');
		$("#IC_Type").find("option[value='"+selectedVal+"']").attr('selected','selected');
		
		//send message to injected JS to hilight the selected option
		sendMessageToInjectedJS({
				'action'	: "hilightInput",
				'src'		: 'popup',
				'target'	: {
					'name'	:	inputs[selectedVal].name,
					'id'	:	inputs[selectedVal].id,
					}
			});
		
	});
	
	//Used to find the best match later
	var alreadyAutoSelected = 0;
	
	for(var x in inputs)
	{
		var txtPrefix = (1*x+1)+": ";
		$("#IC_ID").append(
			$("<option>")
				.val(x)
				.text(txtPrefix + truncateInputAttribute(inputs[x].id))
		);
		$("#IC_name").append(
			$("<option>")
				.val(x)
				.text(txtPrefix + truncateInputAttribute(inputs[x].name))
		);
		$("#IC_LabelText").append(
			$("<option>")
				.val(x)
				.text(txtPrefix + truncateInputAttribute(inputs[x].labelText))
		);
		$("#IC_Type").append(
			$("<option>")
				.val(x)
				.text(txtPrefix + truncateInputAttribute(inputs[x].type))
		);
		
		//Select one by attempting to match the mintsync name against the following:
		// * LabelText
		// * ID
		// * Name
		valueName = valueName.toLowerCase();
		if	(	inputs[x].labelText.toLowerCase(valueName).indexOf(valueName) != -1 
				&& alreadyAutoSelected < 4	)
		{
			$("#IC_LabelText").val(x).change();
			
			alreadyAutoSelected = 4;
		}
		else if (	inputs[x].id.toLowerCase(valueName).indexOf(valueName) != -1 
						&& alreadyAutoSelected < 2	)
		{
			$("#IC_ID").val(x).change();
			alreadyAutoSelected = 2;
		}
		else if	(	inputs[x].name.toLowerCase(valueName).indexOf(valueName) != -1 
							&& alreadyAutoSelected < 1	)
		{
			$("#IC_name").val(x).change();
			alreadyAutoSelected = 1;
		}
	}
	//if no box was automatically selected then trigger the change event to make the first
	//box the current option
	if ( alreadyAutoSelected == 0 )
		$("#IC_ID").change();
		
	var overlay = $("#InputChooserPrompt").data("overlay").load();
	
	$(overlay).one('onLoad',function(){
			//focus on the default displayed box (Label text)
			$("#IC_LabelText").focus();
		})
		.one('onClose',function(event){
			if($("#IC_closedDialogState").val()!="0")	//if not "close"
			{
				//get the selected item
				var selectedIndex = $("#IC_ID option:selected").val();
				completeCallback(inputs[selectedIndex], $("#IC_closedDialogState").val()=="2", $("#IC_closedDialogState").val()=="3");
			}
			else
			{
				//send message to injected JS to trigger an unhighlight
				sendMessageToInjectedJS({
					'action'	: "hilightInput",
					'src'		: 'popup',
					'target'	: {
						'name'	:	"",
						'id'	:	"",
						}
				});
			}
		});
}