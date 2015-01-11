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
	
	/**
	Send Credentials Data for Domain
	*/
	this.setPassword = function(context) {
		var domainName=$.trim($("#domainName").val()),
			RowSalt = $MS.generateRowSalt(),
			encryptedData = "",
			CredentialsObj = {},
			force = false;
			
		if(domainName === "")
		{
			$("#saveOutput").text("Error: No URL entered, no save has occurred");
			return;
		}
		
		//build JS Object to JSONify
		$("#inputPassContainer").children("p").each(function(index,Element){
			var name = "", password="";
			
			name		= $(this).children("input[name='inputPassName']").val(); 
			password	= $(this).children("input[name='inputPassValue']").val();
			
			CredentialsObj[name]=password;
		});
		
		$MS.getKeySlot({
			success: function(returnedData){
				var cryptoScheme = 1;
				$MC.encodeAndEncrypt(CredentialsObj, RowSalt, returnedData.data.keySlot0, cryptoScheme, function(encryptedData,cryptoHash){
					CredentialsObj = {};
					
					//check is overwrites are allowed (force)
					force = $("#canForceWrite:checked").val();
					$MS.setPassword(domainName,encryptedData,RowSalt,cryptoHash,force,cryptoScheme,{
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
							stubFunctions.genericPostMessage({
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
}

var addCredentialForm = new AddCredentialForm();