/* jshint multistr:true */

function MS_Lightboxes() {
	var self = this;
	function initModal(selector, callbacks) {
		$(selector)
			.addClass("modalDialog")
			.modal({
				overlayClose: true,
				escClose: true,
				onClose: function (dialog) {
					if (callbacks && callbacks.abort)
						callbacks.abort();
					$.modal.close();
					$(selector).remove();
				},
			});
	}
	
	/** 
	Initialise the lightboxes
	*/
	this.setupLightboxes = function()
	{
	}
	
	/**
		Substitute for Prompt, used for passwords
	*/
	this.askForPassword = function(prompt, completeCallback)
	{
		//add the ask for a password box
		$("body").append("<div id='passwordPrompt'>\
				<h2 id='dialogPasswordInstruction'>Enter your password</h2>\
				<form novalidate>\
					<p><input name='dialogPassPassword' id='dialogPassPassword'type='password' value='' required /></p>\
					<p class='centeredContents'><input type='submit' class='close'/></p>\
				</form>\
			</div>");
		
		initModal("#passwordPrompt");
		
		//add onsubmit handlers to do nothing
		$("#passwordPrompt form").submit(function(event){
			event.preventDefault();
			return false;
		});
		
		$("#dialogPassPassword").val("");
		$("#dialogPasswordInstruction").text(prompt);
		$("#passwordPrompt input.close").click(function(event){
			event.preventDefault();
			completeCallback($("#dialogPassPassword").val());
			$(this).unbind(event);
			$("#passwordPrompt").remove();
			self.forceCloseLightbox("#passwordPrompt");
		});
		$("#dialogPassPassword").focus();
	}
	
	/**
		Substitute for Prompt used for authentication (un/pass)
	*/
	this.askForUsernamePassword = function(prompt,completeCallback)
	{
		//user login box
		$("body").append("<div id='authenticationPrompt'>\
				<h2 id='authenticationInstruction'>Enter your username and password</h2>\
				<form novalidate>\
					<p><label for='dialogAuthUsername'>Username</label><input name='dialogAuthUsername' id='dialogAuthUsername' type='text' value='' placeholder='Username' required /></p>\
					<p><label for='dialogAuthPassword'>Password</label><input name='dialogAuthPassword' id='dialogAuthPassword' type='password' value='' required /></p>\
					<p class='centeredContents'><input type='submit' class='close'/></p>\
				</form>\
			</div>");
		
		initModal("#authenticationPrompt");
		
		//add onsubmit handlers to do nothing
		$("#authenticationPrompt form").submit(function(event){
			event.preventDefault();
			return false;
		});
		
		$("#dialogAuthUsername").val("");
		$("#dialogAuthPassword").val("");
		$("#authenticationPrompt input.close").click(function(event){
			event.preventDefault();
			completeCallback({
				'username': $("#dialogAuthUsername").val(),
				'password':	$("#dialogAuthPassword").val()
			});
			$(this).unbind(event);
			$("#authenticationPrompt").remove();
			self.forceCloseLightbox("#authenticationPrompt");
		});
		$("#dialogAuthUsername").focus();
	}
	
	/**
		Select the correct input box to inject the values into!
	 */
	this.chooseInputForInject = function(inputs, valueName, completeCallback)
	{
		//input tag selector for value injection
		$("body").append("<div id='InputChooserPrompt'>\
				<h2 id='InputChooserInstruction'>Select the correct input tag using the properties below:</h2>\
				<form novalidate>\
					<div id='InputChooserTableContainer' ></div>\
					<p class='centeredContents'><input type='hidden' id='IC_closedDialogState' value='0' />\
						<input type='submit' value='OK' class='close' id='IC_OKButton'/> \
						<input type='submit' value='OK + Next' class='close' id='IC_OKNextButton' /> \
						<input type='submit' value='OK + Submit' class='close' id='IC_OKSubmitButton' /> \
						<input type='submit' value='Close' class='close' id='IC_closeButton' />\
					</p>\
				</form>\
			</div>");
		
		initModal("#InputChooserPrompt",{
			abort: function() {
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
		
		//add onsubmit handlers to do nothing
		$("#InputChooserPrompt form").submit(function(event){
			event.preventDefault();
			return false;
		});
		
		$("#IC_LabelText").focus();
				
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
		
		$("#IC_closeButton").one('click', function() {
			event.preventDefault();
			self.forceCloseLightbox("#InputChooserPrompt");
		});
		
		$("#IC_OKButton").one('click', function(event) {
			event.preventDefault();
			//get the selected item
			var selectedIndex = $("#IC_ID option:selected").val();
			completeCallback(inputs[selectedIndex], false, false);
			$("#InputChooserPrompt").remove();
			self.forceCloseLightbox("#InputChooserPrompt");
		});
		$("#IC_OKNextButton").one('click',function() {
			event.preventDefault();
			//get the selected item
			var selectedIndex = $("#IC_ID option:selected").val();
			completeCallback(inputs[selectedIndex], true, false);
			$("#InputChooserPrompt").remove();
			self.forceCloseLightbox("#InputChooserPrompt");
		});
		$("#IC_OKSubmitButton").one('click',function() {
			event.preventDefault();
			//get the selected item
			var selectedIndex = $("#IC_ID option:selected").val();
			completeCallback(inputs[selectedIndex], false, true);
			$("#InputChooserPrompt").remove();
			self.forceCloseLightbox("#InputChooserPrompt");
		});
		$("#IC_ExpandLink").one('click' ,function(event) {
			event.preventDefault();
			$(".expanded").show();
			$("#IC_ExpandLink").parent().hide();
			return false;
		});
		
		$("#IC_ID, #IC_name, #IC_LabelText, #IC_Type").change(function() {
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
			if	(	inputs[x].labelText.toLowerCase(valueName).indexOf(valueName) != -1 && 
					alreadyAutoSelected < 4	)
			{
				$("#IC_LabelText").val(x).change();
				
				alreadyAutoSelected = 4;
			}
			else if (	inputs[x].id.toLowerCase(valueName).indexOf(valueName) != -1 && 
						alreadyAutoSelected < 2	)
			{
				$("#IC_ID").val(x).change();
				alreadyAutoSelected = 2;
			}
			else if	(	inputs[x].name.toLowerCase(valueName).indexOf(valueName) != -1 && 
						alreadyAutoSelected < 1	)
			{
				$("#IC_name").val(x).change();
				alreadyAutoSelected = 1;
			}
		}
		//if no box was automatically selected then trigger the change event to make the first
		//box the current option
		if(alreadyAutoSelected === 0)
			$("#IC_ID").change();
	}
	this.modalThis = function(modalTarget, callbacks)
	{
		if (! modalTarget instanceof jQuery) {
			return;
		}
		initModal(modalTarget, callbacks);
	}
	this.forceCloseLightbox = function(modalTarget) {
		$.modal.close();
	}
}

var lightboxes = new MS_Lightboxes();