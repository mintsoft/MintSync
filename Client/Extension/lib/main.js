/**
	This is firefox's equivilent to bg.js
*/
var data = require("sdk/self").data;
var tabs = require('sdk/tabs');

//http://stackoverflow.com/questions/9098828/how-to-reload-a-widget-popup-panel-with-firefox-addon-sdk

function getPanel(contentURL, contentScriptFile, contentScript){
	var popupPanel = require("sdk/panel").Panel({
		position: {
			bottom: 5,
			right: 8
		},
		width: 330,
		height: 260,
		contentURL: contentURL
	//	contentScriptFile: data.url("includes/ins.js")
	});

	popupPanel.port.on("getURL", function(){
		console.log("getURL called, " + tabs.activeTab.url);
		popupPanel.port.emit("currentURL", tabs.activeTab.url);
		console.log("getURL: after the emit");
	});
	
	return popupPanel;
}
 
// Create a widget, and attach the panel to it, so the panel is
// shown when the user clicks the widget.
var widget = require("sdk/widget").Widget({
	label: "MintSync Popup",
	id: "mintsync-popup",
	contentURL: data.url("img/button_icon.png"),
	onClick: function() {
		var newPanel = getPanel(data.url("popup.html"));
		newPanel.show();
	}
});