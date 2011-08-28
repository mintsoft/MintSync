/** JS used on the password matrix page **/
/** Timer objects and variable for alternating the page width **/
var keyTimer, clickTimer, 
containerWidth={0:"50em", 1:"90%"}, containerWidthKey=0, varWidthButtonText="|> <|";

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
	
	//add variable width button
	$("#variableWidth").click(function(){
		containerWidthKey = 1-containerWidthKey;
		$("#mint_matrixContainer").css({"width":containerWidth[containerWidthKey]});
		
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
			Console.log("An error has occurred: "+textStatus,errorThrown);
		},
		success: function(data,textStatus,jq) {
			var parsedData = $.parseJSON(data);
			
			if(parsedData.status=="ok")
			{
				//create list of domains
				updatePasswordMatrix(parsedData.data);
			}
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
			event.preventDefault();
			//single Click
			showPasswordsForURL(this);
		},
		function(event){
			var objClicked = this;	//this is used in the callback context later
			//double Click - change h3 into an input box
			event.preventDefault();
			
			//TODO: replace prompt with something better
			var newURL = prompt("Change URL:",$(this).text());
			if(!newURL)
				return false;
				
			$MS.renameURL(	$(this).parent().find("input[name='ID']").val(), newURL,	{
					beforeSend: function() {},
					complete: function() {},
					success: function(data,textStatus,jq) {
						var parsedObject = $.parseJSON(data);
						
						switch (parsedObject.status)
						{
							case "ok":
								//update the record
								$(objClicked).text(newURL);
							break;
							default:
								alert("There was a serious error, see the error console");
								console.log("You have reached an undefined state: "+data);
						}
						
					},
					error: function(jq,textStatus,errorThrown){
						alert("Error");
						console.log("Error:"+textStatus+" : "+errorThrown);
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
				success: function(data,textStatus) {
					console.log(data);
					var parsedObj = $.parseJSON(data);	
					switch(parsedObj.status)
					{
						case "ok":
							//remove the entire li
							$(srcImg).parent().parent().remove();
							
						break;
						default:
							alert("There was an error, see the error console for more information");
							console.log("There was an error with removePasswords: "+data);
					}
				},
				error: function() {
					
				},
				complete: function(status) {
				}
			});
			
		});
	}
	
	$(target).fadeIn(0);
}

/**
	AJAX's the passwords for the clicked URL 
*/
function showPasswordsForURL(srcH3)
{
	$MS.getPasswords($(srcH3).text(),{
		beforeSend: function() {},
		complete: function(jq,textStatus,errorThrown) {},
		success: function(data,textStatus,jq) {
			
			parsedObject = $.parseJSON(data);
			switch(parsedObject.status)
			{
				case "ok":
					credentialsObj = $MC.decodeAndDecrypt(parsedObject.data.Credentials)
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
									$("<input type='password' onfocus='revealPassword(this);' onblur='rehidePassword(this);'>").val(credentialsObj[index])
								)
							)
						);
					}
					
					$(srcH3).parent().find(".dropDownContent").slideDown(0);
					
				break;
				default:
					console.log("An Error Has Occurred with the data:"+parsedObject);
				
			}
		},
		error: function(jq,textStatus,errorThrown){
			console.log("An unexpected error has occurred ("+textStatus+"): " + errorThrown);
		}
	});
}


/**
	Function that performs the filtering of URLS depending on the value in the search box
*/
function doListFiltering(){
	var stringValue = $("#searchValue").val()
	if(stringValue!== "")
	{		
		//filter based on stringValue
		$("#PasswordList li").hide(0);
		$("#PasswordList li h3:contains('"+stringValue+"')").parent().show(0);
	}
	else
	{
		$("#PasswordList li").show(0);
	}
}