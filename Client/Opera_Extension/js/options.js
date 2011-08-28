/** 
	Options.js file.
	Contains javascript for the options pages
*/
/**
	Entry point
*/
$(document).ready(function(){
	/* Load Preferences */
	$("#ServerURL").val(widget.preferences["ServerURL"]);
	$('input[name="SavePass"][value="'+widget.preferences["SavePassword"]+'"]').prop('checked', true);
	$('input[name="Cipher"][value="'+widget.preferences["Cipher"]+'"]').prop('checked', true);
	$('input[name="KeyLength"][value="'+widget.preferences["KeyLength"]+'"]').prop('checked', true);
	$('input[name="AutoFetch"][value="'+widget.preferences["AutoFetch"]+'"]').prop('checked', true);
	$('input[name="Notify"][value="'+widget.preferences["Notify"]+'"]').prop('checked', true);
	$('input[name="NotifySource"][value="'+widget.preferences["NotifySource"]+'"]').prop('checked', true);
	$("#NotifySourceUpdatePeriod").val(widget.preferences["NotifySourceUpdatePeriod"]);

	/* generation options */
	$('#passwordStrengthNum').prop('checked',	widget.preferences["passwordStrengthNum"]=="true");
	$('#passwordStrengthPunc1').prop('checked',	widget.preferences["passwordStrengthPunc1"]=="true");
	$('#passwordStrengthPunc2').prop('checked',	widget.preferences["passwordStrengthPunc2"]=="true");
});

/** Set Save Preferences */
function savePrefs() {
	widget.preferences["ServerURL"] 	= $("#ServerURL").val();
	widget.preferences["SavePassword"]	= $("input[type=radio][name=SavePass]:checked").val();
	widget.preferences["Cipher"] 		= $("input[type=radio][name=Cipher]:checked").val();
	widget.preferences["KeyLength"] 	= $("input[type=radio][name=KeyLength]:checked").val();
	widget.preferences["AutoFetch"]		= $("input[type=radio][name=AutoFetch]:checked").val();
	widget.preferences["Notify"]		= $("input[type=radio][name=Notify]:checked").val();
	widget.preferences["NotifySource"]	= $("input[type=radio][name=NotifySource]:checked").val();
	widget.preferences["NotifySourceUpdatePeriod"] = $("#NotifySourceUpdatePeriod").val();
	
	/* generation options */
	widget.preferences["passwordStrengthNum"]		= $("#passwordStrengthNum").is(":checked");
	widget.preferences["passwordStrengthPunc1"]		= $("#passwordStrengthPunc1").is(":checked");
	widget.preferences["passwordStrengthPunc2"]		= $("#passwordStrengthPunc2").is(":checked");
	
	if(widget.preferences["SavePassword"]!=1)
	{
		widget.preferences["SavedPassword"]=undefined;
	}
	
	/**
		This is so the effects of a change to the notification caching are immediate
	*/
	if(		widget.preferences["Notify"]=="0" || 
			widget.preferences["Notify"]=="1"  && widget.preferences["NotifySource"]!="cache"		)
	{
		//should not be keeping a local cache, send a message to the bg process and stop it
		//this uses a message because it does not work if clearTimeout is used from here
		
		//stopLocalCache
		opera.extension.postMessage({
			'action': 'stopLocalCache',
			'src' : 'options',
		});

	}
	else
	{
		//the cache should be kept, so start the timeout
		
		opera.extension.postMessage({
			'action': 'startLocalCache',
			'src' : 'options',
		});
		//startLocalCache
	}
	
}
	