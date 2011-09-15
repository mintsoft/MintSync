/** JS used on the password matrix page **/
/** Timer objects and variable for alternating the page width **/
var keyTimer, clickTimer, 
containerWidth = {0:"50em", 1:"90%"}, containerWidthKey = 0, varWidthButtonText = "|> <|";

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
}

/** jQuery entry point */
$(document).ready(function(){
	
	setupLightboxes();
	
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
	
	//load the list of urls
	$MS.listURLS({
		beforeSend: function() {
			$("#matrixLoading").fadeIn(0);
		},
		complete: function() {
			$("#matrixLoading").fadeOut(0);
		},
		error: function(jq,textStatus,errorThrown) {
			switch(jq.status)
			{
				case 401:	//incorrect login
					alert("List URLs failed due to incorrect Login, please try again");
				break;
				default:
					alert("An error occurred whilst listing URLs, this is probably due to not having any saved credentials. See the error console for more information");
					console.log("You have reached an undefined state ("+jq.status+" "+textStatus+"): " + errorThrown);
			}
		},
		success: function(requestdata,textStatus,jq) {
			//create list of domains
			updatePasswordMatrix(requestdata.data);
		},
	});
	
	//add search handler with a timeout
	$("#searchValue").keypress(function(event){
		if(event.which === 13 ) //enter key
			event.preventDefault();
			
		clearTimeout(keyTimer);
		keyTimer = setTimeout(doListFiltering,400);	//TODO: get the duration from a preference
	});

});




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
							
						},
						error: function(jq,textStatus,errorThrown) {
							switch(jq.status)
							{
								case 401:	//incorrect login
									alert("Rename Failed: Incorrect Login. Please try again");
								break;
								default:
									alert("There was a serious error, see the error console");
									console.log("You have reached an undefined state ("+jq.status+" "+textStatus+"): " + errorThrown);
							}
						}
				});
				
				return false;
			},200);
		
		//add click handler to the bin icon to handle deletion/removal
		$(tmpObj).find("p.binIcon img.bin").click(function(){
			var id	= $(this).parent().siblings().find("input[name='ID']").val(),
				url	= $(this).parent().siblings("h3").text(),
				srcImg = this;
			
			if(!confirm("Are you sure you wish to delete: "+url+"?\n\nOnce deleted, this cannot be recovered"))
				return false;
			
			$MS.removePasswords(id,url,{
				beforeSend: function() {
				},
				success: function(requestdata,textStatus) {
					//remove the entire li
					$(srcImg).parent().parent().remove();

				},
				error: function(jq,textStatus,errorThrown) {
					switch(jq.status)
					{
						case 401:	//incorrect login
							alert("Delete Failed: Incorrect Login. Please try again");
						break;
						default:
							alert("There was an error, see the error console for more information");
							console.log("You have reached an undefined state ("+jq.status+" "+textStatus+"): " + errorThrown);
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
		$MS.getPasswords($(srcH3).text(),{
			beforeSend: function() {},
			complete: function(jq,textStatus,errorThrown) {},
			success: function(requestdata,textStatus,jq) {
				 $MC.decodeAndDecrypt(requestdata.data.Credentials,requestdata.data.Salt,{
					 success:function(credentialsObj){
						//object of key-value pairs
						var table = $(srcH3).parent().find("table"),
							tableBody = table.find("tbody");
						
						tableBody.empty();
						
						for(index in credentialsObj)
						{
							tableBody.append(
								$("<tr>").append(
									$("<td>").text(index),
									$("<td>").append(
										$("<input type='password' onfocus='revealPassword(this);' readonly='readonly' onblur='rehidePassword(this);'>").val(credentialsObj[index])
									)
								)
							);
						}
						
						$(srcH3).parent().find(".dropDownContent").slideDown(0);
						$(srcH3).addClass('expanded');
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
						console.log("An unexpected error has occurred ("+jq.status+" "+textStatus+"): " + errorThrown);
				}
			}
		});
	}
}


/**
	Function that performs the filtering of URLS depending on the value in the search box
*/
function doListFiltering(){
	var stringValue = $("#searchValue").val()
	if(stringValue!== "")
	{		
		//filter based on stringValue
		$("#PasswordList li").hide();
		$("#PasswordList li h3:contains('"+stringValue+"')").parent().show();
	}
	else
	{
		$("#PasswordList li").show();
	}
}