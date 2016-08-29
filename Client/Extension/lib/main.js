/**
	This is firefox's equivilent to bg.js
*/
var {ToggleButton} = require('sdk/ui/button/toggle');
var data = require("sdk/self").data;
var tabs = require('sdk/tabs');
var panels = require("sdk/panel");
//Source the background JS

//http://stackoverflow.com/questions/9098828/how-to-reload-a-widget-popup-panel-with-firefox-addon-sdk

function getPanel(contentURL, contentScriptFile, contentScript){
	var popupPanel = panels.Panel({
		position: {
			bottom: 5,
			right: 8
		},
		width: 330,
		height: 260,
		contentURL: contentURL,
		onHide: handleHide
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

var button = ToggleButton({
	label: "MintSync Popup",
	id: "mintsync-popup",
	icon: {
		'16': './img/button_icon16.png',
		'32': './img/button_icon.png'
	},
	badge: 0,
	badgeColor: '#AAA',
	onChange: function(state) {
		if(!state.checked)
			return;
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
		
		newPanel.show({position: button});
	}
});

function handleHide() {
	button.state('window', {checked: false});
}


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
/* jshint sub:true */
// Persistant variables for browserSession
/*
var mintSyncGlobals = {
	'passwd': undefined,			//saved crypto password
	'authentication': undefined,	//save auth details
	'cacheTimer': undefined,		//URL Cache timer
	'urlCache': [],				//array of URLS
	'passwdResetTimer': undefined,	//URL Cache timer
	'theButton': undefined			//the button on the toolbar
};

function genericRetrieve_preferencesObj(){
	var ss = require("sdk/simple-storage");
	return ss.storage;
}*/
var stubs = require(data.url("js/stubFunctions.js"));
var bg = require("bg.js");