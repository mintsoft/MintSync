function PasswordMatrix(optionsPage) {
	/** JS used on the password matrix page **/
	/** Timer objects and variable for alternating the page width **/
	var keyTimer, clickTimer, containerWidth = {0:"50em", 1:"90%"}, containerWidthKey = 0, varWidthButtonText = "|> <|";

	/**
		Single/Double Click jQuery Extension/Hack
		
		https://gist.github.com/399624
	*/
	jQuery.fn.single_double_click = function(single_click_callback, double_click_callback, timeout) {
		return this.each(function(){
			var clicks = 0, self = this;
			jQuery(this).click(function(event){
				clicks++;
				if (clicks == 1) {
					setTimeout(function(){
						if(clicks == 1) {
							single_click_callback.call(self, event);
						} else {
							double_click_callback.call(self, event);
						}
						clicks = 0;
					}, timeout || 300);
				}
			});
		});
	};

	var verifyAndCacheCryptoPassword = function(successCallback){
		$MS.getEncryptionPasswordHash(function(passwordHash) {
			$MS.verifyCryptoPass(passwordHash, {
				success: successCallback,
				error: function() {
					verifyAndCacheCryptoPassword(successCallback);
				}
			});
		});
	};
	/** jQuery entry point */
	$(document).ready(function(){
		$(document).autoBars(function() {
			var saveFormMarkup = $.handlebarTemplates['saveForm']({});
		
			lightboxes.setupLightboxes();

			$("#addCredentialButton").click(function(e){
				e.preventDefault();
				verifyAndCacheCryptoPassword(function() {

					$("#saveFormContainer").html(saveFormMarkup);
					addCredentialForm.AddBindings("#addPairP");
					addCredentialForm.addPair();
					
					lightboxes.modalThis($("#saveFormContainer"), {
						abort: function(event) {
							console.log("Modal Closed/Aborted");
							$("#saveFormContainer").html("");
							$("#PasswordList").empty();
							UpdateMainURLList();
						}
					});
					$("#saveButton").click(function(event){
						event.preventDefault();
						addCredentialForm.setPassword($("#SaveForm"));
					});
					
				});
			});
			
			//add variable width button
			$("#variableWidth").click(function(){
				containerWidthKey = 1-containerWidthKey;
				
				$('#mint_matrixContainer').animate({
					width: containerWidth[containerWidthKey]
					}, 'slow', 'swing');
		
				tmp = varWidthButtonText;
				varWidthButtonText=$("#variableWidth").text();
				$("#variableWidth").text(tmp);
				
			});

			UpdateMainURLList();

			//add search handler with a timeout
			$("#searchValue").keypress(function(event){
				if(event.which === 13 ) //enter key
					event.preventDefault();
					
				clearTimeout(keyTimer);
				keyTimer = setTimeout(doListFiltering,200);	//TODO: get the duration from a preference
			});
			
			Mousetrap.bind(['alt+f','ctrl+f'], function(event) { 
				event.preventDefault();
				$("#searchValue").focus();
				return false;
			});
			Mousetrap.bind('alt+1', function(event) {
				event.preventDefault();
				clickTheNthRow(1);
			});
			Mousetrap.bind('alt+2', function(event) {
				event.preventDefault();
				clickTheNthRow(2);
			});
			Mousetrap.bind('alt+3', function(event) {
				event.preventDefault();
				clickTheNthRow(3);
			});
			Mousetrap.bind('alt+4', function(event) {
				event.preventDefault();
				clickTheNthRow(4);
			});
			Mousetrap.bind('alt+5', function(event) {
				event.preventDefault();
				clickTheNthRow(5);
			});
			Mousetrap.bind('alt+6', function(event) {
				event.preventDefault();
				clickTheNthRow(6);
			});
			Mousetrap.bind('alt+7', function(event) {
				event.preventDefault();
				clickTheNthRow(7);
			});
			Mousetrap.bind('alt+8', function(event) {
				event.preventDefault();
				clickTheNthRow(8);
			});
			Mousetrap.bind('alt+9', function(event) {
				event.preventDefault();
				clickTheNthRow(9);
			});
		});
	});

	function clickTheNthRow(n) {
		var items = $("#PasswordList").find("li:visible");
		if(n > items.length) return;
		$(items[n-1]).find("h3").click();
	}

	function UpdateMainURLList() {
		//load the list of urls
		$MS.listURLS({
			beforeSend: function () {
				$("#matrixLoading").fadeIn(0);
			},
			complete: function () {
				$("#matrixLoading").fadeOut(0);
			},
			error: function (jq, textStatus, errorThrown) {
				switch (jq.status) {
					case 401:	//incorrect login
						UpdateMainURLList();
					break;
					default:
						alert("An error occurred whilst listing URLs, this is probably due to not having any saved credentials. See the error console for more information");
						console.error("You have reached an undefined state (" + jq.status + " " + textStatus + "): " + errorThrown);
				}
			},
			success: function (requestdata, textStatus, jq) {
				//create list of domains
				updatePasswordMatrix(requestdata.data);
				$("#searchValue").focus();
				$MP.fetch(function(){
					optionsPage.updateForm();
				});
			}
		});
	}

	/**
		Updates the password matrix with the passed array
		
		Sets and defines the event handlers
		
	*/
	function updatePasswordMatrix(sourceArray)
	{
		//copy template for each password
		var target	= document.getElementById("PasswordList"),
			source	= document.getElementById("template-li");
		
		for(var x in sourceArray)
		{
			var	tmpObj;
			tmpObj = document.createElement(source.tagName);
			tmpObj.innerHTML = source.innerHTML;
			
			$(tmpObj).find("h3").text(sourceArray[x].URL);
			$(tmpObj).find("input[type='hidden']").val(sourceArray[x].ID);

			target.appendChild(tmpObj);
			
			//add click handler to the H3
			$(tmpObj).find("h3").single_double_click(function(event){
					/**
						single Click - show/hide URLS
					*/
					event.preventDefault();
					
					togglePasswordsForURL(this);
					return false;
				},
				function(event){
					/**
						double Click - Edit URL
					*/
					var objClicked = this;	//this is used in the callback context later
					
					event.preventDefault();
					
					//TODO: replace prompt with something better
					var newURL = prompt("Change URL:",$(this).text());
					if(!newURL)
						return false;
						
					$MS.renameURL(	$(this).parent().find("input[name='ID']").val(), newURL,	{
							beforeSend: function() {},
							complete: function() {},
							success: function(requestdata,textStatus,jq) {
							
								//update the record
								$(objClicked).text(newURL);
								
								//update the local cache
								stubFunctions.genericPostMessage({
									'action': 'updateLocalCache',
									'src' : 'passwordMatrix',
								});
							},
							error: function(jq,textStatus,errorThrown) {
								switch(jq.status)
								{
									case 401:	//incorrect login
										alert("Rename Failed: Incorrect Login. Please try again");
									break;
									case 409:	//conflicting LIKE pattern
										//parse response object
										var responseData = $.parseJSON(jq.responseText);
										alert("The rename has been rejected:\n\n"+responseData.data.reason);
									break;
									default:
										alert("There was a serious error, see the error console");
										console.error("You have reached an undefined state ("+jq.status+")");
										console.error(jq);
										console.error(textStatus, errorThrown);
								}
							}
					});
					
					return false;
				},200);
			
			//add click handler to the bin icon to handle deletion/removal
			$(tmpObj).find("p.rowIcons img.bin").click(function(){
				var id	= $(this).parent().siblings().find("input[name='ID']").val(),
					url	= $(this).parent().siblings("h3").text(),
					srcImg = this;
				
				if(!confirm("Are you sure you wish to delete: "+url+"?\n\nOnce deleted, this cannot be recovered"))
					return false;
				
				$MS.removePasswords(id,url,{
					beforeSend: function() {},
					success: function(requestdata,textStatus) {
						//remove the entire li
						$(srcImg).parent().parent().remove();

						//update the local cache
						stubFunctions.genericPostMessage({
							'action': 'updateLocalCache',
							'src' : 'passwordMatrix',
						});
					},
					error: function(jq,textStatus,errorThrown) {
						switch(jq.status)
						{
							case 401:	//incorrect login
								alert("Delete Failed: Incorrect Login. Please try again");
							break;
							default:
								alert("There was an error, see the error console for more information");
								console.error("You have reached an undefined state ("+jq.status+" "+textStatus+"): " + errorThrown);
						}
					},
					complete: function(status) {
					}
				});
				return false;
			});
		}
		
		$(target).fadeIn(0);
	}

	/**
		AJAX's the passwords for the clicked URL 
	*/
	function togglePasswordsForURL(srcH3)
	{
		if($(srcH3).hasClass('expanded'))
		{
			$(srcH3).siblings("div.dropDownContent").hide();
			$(srcH3).removeClass('expanded');
		}
		else
		{
			$MS.getPasswordsByID($(srcH3).siblings("div.dropDownContent").children("input[name='ID']").val(),{
				beforeSend: function() {},
				complete: function(jq,textStatus,errorThrown) {},
				success: function(requestdata,textStatus,jq) {
					$MC.decodeAndDecrypt(requestdata.data.Credentials, requestdata.data.Salt, requestdata.data.keySlot0, requestdata.data.cryptoScheme, {
						success:function(credentialsObj){
							
							//object of key-value pairs
							var table = $(srcH3).parent().find("table"),
								tableBody = table.find("tbody");
							
							tableBody.empty();
							
							for(var index in credentialsObj)
							{
								tableBody.append(
									$("<tr>").append(
										$("<td class='pm_label'>")
											.text(index)
											.dblclick(function(){
												var name = $(this).text();
												$(this).empty();
												$(this).append(
													$("<input type='text' name='key' />")
														.val(name)
												);
										}),
										$("<td class='pm_value'>").append(
											$("<input type='password' readonly='readonly' >")
												.val(credentialsObj[index])
												.dblclick(function(event) {
													//when the fields are double clicked, hilight individual characters
													//event.target is the element clicked
													event.preventDefault();
												})
												.focus(function(event) {
													revealPassword(this);
												})
												.blur(function(event){
													rehidePassword(this);
												}),
											$("<img src='img/expandDown.png' class='explodeIcon clickable' alt='Explode' title='Explode Password' />").click(function(event){
												handleShowIndividualCharacters($(this).siblings("input"));
											})
										),
										$("<td class='pm_controls'>").append(
											$("<img src='img/qr.png' alt='Show as QR Code' class='qrValue jsAction' />").click(function(e){
												e.preventDefault();
												lightboxes.qrModal();
												var qrcode = new QRCode($("#QRRenderTarget")[0], {
													width : 200,
													height : 200
												});
												qrcode.makeCode($(this).parent().parent().find(".pm_value input").val());
											}),
											$("<img src='img/del.png' alt='Delete Pair' class='removePair jsAction' />").click(function(e){
												e.preventDefault();
												$(this).parent().parent().remove();
											})
										)
									)
								);
							}
							
							$(srcH3).parent().find(".dropDownContent").slideDown(0);
							$(srcH3).addClass('expanded');
							
							$(srcH3).parent().find(".save").click(function(e){
								e.preventDefault();

								var credTable = $(this).parent().parent().parent().parent(),
									domainName = $(this).parent().parent().parent().parent().parent().siblings("h3").text(),
									force = true,
									credentialsObject = {},
									rowSalt = $MS.generateRowSalt();

								$(credTable).find("tbody tr").each(function(index, element){
									var key = $(this).find("td.pm_label input[name=key]").val();
									if(!key)
										key = $(this).children("td.pm_label").text();

									var value = $(this).find("td.pm_value input[type=password]").val();
									credentialsObject[key] = value;
								});

								$MS.getKeySlot({
									success: function(returnedKeyslot){
										var cryptoScheme = 2;
										$MC.encodeAndEncrypt(credentialsObject, rowSalt, returnedKeyslot.data.keySlot0, cryptoScheme, function(encryptedData, cryptoHash) {
											credentialsObject = {};
											$MS.setPassword(domainName, encryptedData, rowSalt, cryptoHash, force, cryptoScheme,{
												error: function(jq,textStatus,errorThrown) {
													alert("An undefined error has occurred, see the error console for more information");
													console.error("An Error Occurred:" + textStatus + "\n" + errorThrown+"\n"+jq.responseText);
													console.error(jq);
												},
												success: function(requestdata,textStatus,jq) {
													stubFunctions.genericPostMessage({
														'action': 'updateLocalCache',
														'src' : 'passwordMatrix'
													});
													alert("Credentials saved");
												},
												zzz: function(){}
											});
										});
									}
								});
							});
							$(srcH3).parent().find(".addCredentialPair").click(function(e){
								e.preventDefault();
								var clickEventSrc = this;
								var source	= document.getElementById("template-li");
								
								var	newRow = $("<tr>").append(
									$("<td class='pm_label'>").append(
										$("<input type='text' name='key' />")
									),
									$("<td class='pm_value'>").append(
										$("<input type='password' >")
											.dblclick(function(event) {
												event.preventDefault();
											})
											.focus(function(event) {
												revealPassword(this);
											})
											.blur(function(event){
												rehidePassword(this);
											}),
										$("<img src='img/expandDown.png' class='explodeIcon clickable' alt='Explode' title='Explode Password' />").click(function(event){
											handleShowIndividualCharacters($(this).siblings("input"));
										})
									),
									$("<td class='pm_controls'></td>")
								);
								
								$(this).parents(".results").find("tbody").append(newRow);
							});
						},
						error: function(){
							alert("That decryption password is incorrect. Please try again");
							$MS.resetSavedCryptoPassword();
						}
					});
				},
				error: function(jq,textStatus,errorThrown){
					switch(jq.status)
					{
						case 401:	//incorrect login
							alert("Retrieve failed due to incorrect Login, please try again");
						break;
						default:
							alert("An Error Has Occurred, see the error console for more information");
							console.error("An unexpected error has occurred ("+jq.status+" "+textStatus+"): " + errorThrown);
					}
				}
			});
		}
	}


	/**
		Function that performs the filtering of URLS depending on the value in the search box
	*/
	function doListFiltering(){
		var stringValue = $("#searchValue").val().toLowerCase();

		$("#PasswordList > li.lastVisibleli").removeClass("lastVisibleli");		
		if(stringValue !== "")
		{		
			//filter based on stringValue
			$("#PasswordList li").hide();
			$("#PasswordList h3").filter(":contains('"+stringValue+"')")
				.parent().show()
				.filter(":last")
				.addClass("lastVisibleli");   
		}
		else
		{
			$("#PasswordList li").show();
		}
	}

	/**
		Function to cause the separation of a password field into individual characters for easy viewing
	*/
	function handleShowIndividualCharacters(target) {
		
		if($(target).siblings("table.digits").length>0)
			return;

		var passwordArray = $(target).val().split("");
		var	thead = $("<tr>"),
			tbody = $("<tr class='explodeRow'>");
		
		
		for(var x=0; x<passwordArray.length; ++x)
		{
			thead.append(
					$("<th>")
						.text((x+1))
						.click(function(e){
							$(this).closest("table").find("tr.explodeRow").children("td:nth-child(" + $(this).text() + ")" ).children("input").focus();
						})
				);
			tbody.append(
					$("<td>").append(
						$("<input type='password' readonly='readonly' class='singleDigit' >")
							.val(passwordArray[x])
							.focus(function(event) {
								revealPassword(this);
							})
							.blur(function(event){
								rehidePassword(this);
							})
					).click(function(event){
						$(this).find("input.singleDigit").focus();
					})
				);
		}

		$(target).parent().append(
			$("<table class='digits'>").
				append($("<thead>").append(thead)).
				append($("<tbody>").append(tbody))
		);
	}
}