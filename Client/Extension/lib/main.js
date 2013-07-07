/**
	This is firefox's equivilent to bg.js
*/
var data = require("sdk/self").data;
var tabs = require('sdk/tabs');

// Construct a panel, loading its content from the "text-entry.html"
// file in the "data" directory, and loading the "get-text.js" script
// into it.
var popup = require("sdk/panel").Panel({
	width: 330,
	height: 260,
	contentURL: data.url("popup.html"),
	contentScriptFile: data.url("includes/ins.js")
});
 
// Create a widget, and attach the panel to it, so the panel is
// shown when the user clicks the widget.
require("sdk/widget").Widget({
	label: "MintSync Popup",
	id: "mintsync-popup",
	contentURL: data.url("img/button_icon.png"),
	panel: popup
});

popup.on("show", function() {
	popup.port.emit("onload_equivilent");
});

popup.port.on("getURL", function(){
	console.log("getURL called, " + tabs.activeTab.url);
	popup.port.emit("currentURL", tabs.activeTab.url);
});

/*
require("sdk/tabs").on("ready", logURL);
require("sdk/tabs").on("activate", logURL);
function logURL(tab) {
  runScript(tab);
}
 
function runScript(tab) {
  tab.attach({
    contentScript: "if (document.body) document.body.style.border = '5px solid red';"
  });
}
*/