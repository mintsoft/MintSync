/** Popup specific JS in this file */

//insert the currently selected tab into the box by default

window.addEventListener("load", function() {

	opera.extension.onmessage = function(event) {
		document.getElementById("domainInput").value = event.data;
		document.getElementById("domainName").value = event.data;
		
		if($MS.getAutoFetch()==1)
		{
			getPasswords(event.data);
		}
	}
	
},false);