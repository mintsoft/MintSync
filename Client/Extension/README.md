ToDo
----

To actually implement at all
----------------------------
	Linking the popup to the current tab 
		- Nearly there just need to fix whatever is causing this:
		error: mintsync: An exception occurred.
		NS_ERROR_NOT_AVAILABLE: Component returned failure code: 0x80040111 (NS_ERROR_NOT_AVAILABLE) [nsIWindowWatcher.openWindow]
		Traceback (most recent call last):
		  File "resource://gre/modules/commonjs/sdk/timers.js", line 31, in notify
			callback.apply(null, args);
		  File "resource://gre/modules/commonjs/sdk/content/worker.js", line 74, in emit/<
			self._emitToContent(JSON.stringify(array, replacer));
		  File "resource://gre/modules/commonjs/sdk/content/content-worker.js", line 96, in onChromeEvent
			return emit.apply(null, args);
		  File "resource://gre/modules/commonjs/sdk/content/content-worker.js", line 45, in onEvent
			results.push(callback.apply(null, args));
		  File "resource://gre/modules/commonjs/sdk/content/content-worker.js", line 45, in onEvent
			results.push(callback.apply(null, args));
		  File "resource://jid1-mdrysqrg0vuqlw-at-jetpack/mintsync/data/js/stubFunctions.js", line 18, in null
			alert("currentURL callback fired! "+e);
		  File "resource://gre/components/nsPrompter.js", line 543, in null
			this.openPrompt(args);
		  File "resource://gre/components/nsPrompter.js", line 476, in null
			openModalWindow(this.domWin, uri, propBag);
		  File "resource://gre/components/nsPrompter.js", line 379, in openModalWindow
			Services.ww.openWindow(domWin, uri, "_blank", "centerscreen,chrome,modal,titlebar", args);
			
	Move the Button to the correct place!
	InjectedJS/Popup Communication
	Value Injection


To Check is implemented correctly
---------------------------------

	CORS issues - are these fixed correctly?
	Saving Configuration - is this implemented correctly for an addon?

