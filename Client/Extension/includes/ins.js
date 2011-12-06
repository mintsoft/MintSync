/** 
	This contains the injected script

	Originally this existed so that the background process was able to access the URL from every tab,
	however this now also sends messages to the background process whenever a page is visited in order
	to have the notifications working if they are enabled.
*/
(function(){

	var MS_PopupChannel, 
		MS_LastHighlighted = { 
			'objects'		: [],
			'outlineStyle' 	: [],
			},
		MS_HilightedOutlineStyle = "2px dotted red";

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
			if(inputElements[inputIndex].id == "" && inputElements[inputIndex].name == "")
				continue;
			
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
		for (var ox in MS_LastHighlighted.objects)
		{
			MS_LastHighlighted.objects[ox].style.outline = MS_LastHighlighted.outlineStyle[ox];
		}
	}

	/**
	 *	Build a selector out of the passed object
	 */
	function obj2Selector(obj)
	{
		var selector = obj.id ? "#"+obj.id : "input";
		selector += obj.name ? "[name="+(obj.name)+"]" : "";
		return selector;
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
			
			if(!e.data.target.id && ! e.data.target.name)
				return;
			
			//build a selector
			var selector = obj2Selector(e.data.target);
			
			var elements = window.Sizzle(selector, document);			
			for(var x in elements)
			{
				elements[x].value = e.data.target.value;
			}
			
		}
		else if (e.data.action == 'hilightInput')
		{
			MS_unhighlight_previous_input();
			var objList = null;
			
			var selector = obj2Selector(e.data.target);
			
			objList = window.Sizzle(selector, document);
			
			for (var ox in objList)
			{
				MS_LastHighlighted.outlineStyle[ox] = objList [ox].style.outline;
				objList[ox].style.outline = MS_HilightedOutlineStyle;
			}
			MS_LastHighlighted.objects = objList;
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