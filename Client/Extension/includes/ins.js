/** 
	This contains the injected script

	Originally this existed so that the background process was able to access the URL from every tab,
	however this now also sends messages to the background process whenever a page is visited in order
	to have the notifications working if they are enabled.
*/
(function(){

	var MS_PopupChannel, 
		MS_LastHighlighted = { 
			'object'		: null,
			'outlineStyle' 	: ''
			}
		;

	/**
		Send a message to the background process with information about the input elements
	*/
	function MS_inputnotify(e) {

		//get a list of input boxes with names and their IDs or name, and their associated labels if they exist
		var inputElements = window.Sizzle("input", document),
			serialInputs = new Array(),
			label, labelText
		
		//TODO: filter these based on input types that the user can actually input into
		//	perhaps ( :not(input[type=hidden],input[type=button],input[type=image],input[type=checkbox],input[type=radio],input[type=submit],input[type=reset],input[type=file]) ) instead?
		inputElements = window.Sizzle.matches("input[type=password], input[type=text], input[type=email]", inputElements);

		//serialise the inputElements into an array to pass to the popup
		for(var inputIndex in inputElements)
		{
			if(inputElements[inputIndex].id != "" && inputElements[inputIndex].name != "")
			{
				//Find labels here and somehow link to the input boxes
				label = window.Sizzle("label[for="+inputElements[inputIndex].id+"]",document);
			
				labelText = "";
				if(label && label[0] && label[0].innerText)
					labelText = label[0].innerText;

				//if both of these are blank, then there's no way of actually accessing them except with
				//an xpath, which I'm NOT going to implement ^_^
				serialInputs.push({
					'id'		: inputElements[inputIndex].id,
					'name'		: inputElements[inputIndex].name,
					'type'		: inputElements[inputIndex].type,
					'labelText'	: labelText,
				});
			}
		}

		//send the array to the popup
		e.source.postMessage({
			'action'		: 'inputList',
			'src'			: 'injectedJS',
			'inputs'		: serialInputs,
			'url'			: document.URL
		});

	}

	/**
	 *	Removes the outline from the previously selected input
	 */
	function MS_unhighlight_previous_input()
	{
		//unlight the previous one
		if(MS_LastHighlighted.object)
		{
			//Lastobj = document.getElementById(e.data.target.id);
			
			MS_LastHighlighted.object.style.outline = MS_LastHighlighted.outlineStyle;
		}
	}

	/**
	 *	handle messages using the MS_PopupChannel sent from the popup to this injectedJS
	 */
	function MS_handlePopupMessage(e)
	{
		//opera.postError(e);
		if (e.data.action == 'requestInputList')
		{
			MS_inputnotify(e);
		}
		else if(e.data.action == 'injectValue')
		{
			MS_unhighlight_previous_input();
			//If there was an id, use that to inject the value
			//else, use the name and set them all 
			if(e.data.target.id)
			{
				document.getElementById(e.data.target.id).value = e.data.target.value;
			}
			else if(e.data.target.name)
			{
				var elements = document.getElementsByName(e.data.target.name);
				for(var x in elements)
				{
					elements[x].value = e.data.target.value;
				}
			}
		}
		else if (e.data.action == 'hilightInput')
		{
			MS_unhighlight_previous_input();
			var obj = null;
			
			if(e.data.target.id)
				obj = document.getElementById(e.data.target.id);
			
			if(obj)
			{
				MS_LastHighlighted.outlineStyle = obj.style.outline;
				obj.style.outline = "2px solid red";
			}
			MS_LastHighlighted.object = obj;
		}
	}


	/**
	 * send the URL to the extension, this doesn't depend on the DOM being loaded, so do it asap
	 */
	opera.extension.postMessage({
			'action'	: 'navigate',
			'src' 		: 'injectedJS',
			'url'		: document.URL
		});

	/**
	 * Handler for messages from the BackgroundProcess
	 */
	opera.extension.onmessage = function(e) {
	//	console.debug("InjectedJS Received", e);
		try 
		{	
			if(e.data == "popupConnect")
			{
				MS_PopupChannel = new MessageChannel();
				e.ports[0].postMessage("popupConnect", [MS_PopupChannel.port2]);
				MS_PopupChannel.port1.onmessage = MS_handlePopupMessage;
			}
		}
		catch (error)
		{
			console.error("There was an error with the onmessage callback in the InjectedJS", error);
		}
	};
})();