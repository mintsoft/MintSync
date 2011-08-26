/** Background Process **/

window.addEventListener("load", function(){
	var theButton,
		newWindow,
		ToolbarUIItemProperties = {
			title: "MintSync",
			icon: "img/button_icon.png",
			badge: {},
			popup: {
				href: "popup.html",
				width: 330,
				height: 260
			}
		};
		
	theButton = opera.contexts.toolbar.createItem(ToolbarUIItemProperties);
	opera.contexts.toolbar.addItem(theButton);

	//add connection to popup for currentURL sending
	opera.extension.onconnect = function(event) {
		try {
			event.source.postMessage({
									'action':'click',
									'url':opera.extension.tabs.getFocused().url
								});
		}
		catch(error) {
			//ignore it for now
			alert("There was an error with the Opera Extension OnConnect callback:"+error);
		}
	}

	//add handler for tab notifications
	opera.extension.tabs.onfocus = function() {
		try {
			//console.log("onfocus: "+opera.extension.tabs.getFocused().url);
			if($MS.getNotify())
			{
				$MS.checkIfPasswordsExist(opera.extension.tabs.getFocused().url,{
					error: function(textStatus,errorThrown) {
						console.log("An AJAX Error Occurred:" + textStatus + "\n" + errorThrown);
					},
					success: function(data) {
						var parsedResult = $.parseJSON(data);
						
						switch(parsedResult.status)
						{
							case "ok":
								if(parsedResult.data>0)
								{
									theButton.badge.textContent=" * ";
									theButton.badge.backgroundColor='#00D100';
								}
								else
								{
									theButton.badge.textContent="";
									theButton.badge.backgroundColor='#cccccc';
								}
							break;
							case "fail":
								theButton.badge.textContent="!";
								theButton.badge.backgroundColor='#FFFF00';
								console.log("Failed: "+parsedResult.data.reason);
							break;
							default:
								theButton.badge.textContent="X!";
								theButton.badge.backgroundColor='#DD0000';
								console.log("An unknown state has been reached: "+data);
						}
					}
				});
			}
			else
			{	//reset to no notification visible
				theButton.badge.textContent="";
				theButton.badge.backgroundColor='#cccccc';
			}
		}
		catch(error) {
			//ignore it for now
			alert("There was an error with the Opera Extension OnConnect callback:"+error);
		}
	}
}, false);