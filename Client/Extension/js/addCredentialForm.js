function AddCredentialForm() {
	var self = this;
	this.AddBindings = function(selector)
	{
		$(selector).click(function(event){
			event.preventDefault();
			self.addPair();
		});
	}
	
	/** 
	Adds a new input pair to the popup and defines the click handlers
	*/
	this.addPair = function() 
	{
		var target	= document.getElementById("inputPassContainer"),
			source	= document.getElementById("rowTemplate"),
			tmpObj;
		
		tmpObj = document.createElement(source.firstElementChild.tagName);
		tmpObj.innerHTML = source.firstElementChild.innerHTML;
		
		//add the correct event handlers
		$(tmpObj).find("img.delPair").click(function(event){
			event.preventDefault();
			self.delPair(this);
		});
		$(tmpObj).find("img.injectPass").click(function(event){
			event.preventDefault();
			injectPass(this);
		});
		$(tmpObj).find(".inputPass").focus(function(event){
			revealPassword(this);
		});
		$(tmpObj).find(".inputPass").blur(function(event){
			rehidePassword(this);
		});
			
		target.appendChild(tmpObj);
		
		var passwordLength = $MS.getGeneratedPasswordLength();
		
		//add click handler
		//using contextmenu instead of click so that it can be cancelled on the maximised version
		$(tmpObj).find("input[name='inputPassValue']").bind("contextmenu", function(event){
			if($(this).val() === "")
			{
				$(this).val($MS.generatePassword(passwordLength));
				event.preventDefault();
				return false;
			}
		}).keydown(function(e) {
			if(e.which == 17)
				g_ctrlDown=true;
			else if(g_ctrlDown === true && e.which == 71) {		//ctrl+g
				event.preventDefault();
				$(this).val($MS.generatePassword(passwordLength));
				return false;
			}
			else if(g_ctrlDown === true && e.which == 73) {		//ctrl+i
				event.preventDefault();
				//"click" the inject button
				$(this).parent().find("img.injectPW").click();
				return false;
			}
		});
	}
	
	/**
		Deletes the pair from the passed element
	*/
	this.delPair = function(fromHere)
	{
		fromHere.parentNode.parentNode.removeChild(fromHere.parentNode);
	}
}

var addCredentialForm = new AddCredentialForm();