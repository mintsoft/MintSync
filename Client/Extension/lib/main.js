/**
	This is firefox's equivilent to bg.js
*/
var data = require("sdk/self").data;
 
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
 
// When the panel is displayed it generated an event called
// "show": we will listen for that event and when it happens,
// send our own "show" event to the panel's script, so the
// script can prepare the panel for display.
popup.on("show", function() {
  popup.port.emit("show");
});
 
// Listen for messages called "text-entered" coming from
// the content script. The message payload is the text the user
// entered.
// In this implementation we'll just log the text to the console.
popup.port.on("text-entered", function (text) {
  console.log(text);
  popup.hide();
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