/**
	This is firefox's equivilent to bg.js
*/
var data = require("sdk/self").data;
var tabs = require('sdk/tabs');
//Source the background JS
var bg = require("bg.js");

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
		var contentscriptworker = tabs.activeTab.attach({
			contentScriptFile: [data.url("includes/sizzle.js"),
								data.url("includes/ins.js")]
		});

		//set up the messages between content and popup:
		contentscriptworker.port.on("injected-to-popup", function(e) {
			newPanel.port.emit("injected-to-popup", e);
		});
		newPanel.port.on("popup-to-injected", function(e) {
			contentscriptworker.port.emit("popup-to-injected", e);
		});
				
		newPanel.show();
	}
});

/**
 This is one way of doing content scripts, it might be necessary yet!
*/
/*
var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");
pageMod.PageMod({
	include: "*",
	contentScriptFile:	[	data.url("includes/sizzle.js"),
							data.url("includes/ins.js")
						],
	onAttach: function(worker) {
		worker.port.emit("function", "data");
		worker.port.on("callbackname", function(callbackData) {
		});
	}
});
*/