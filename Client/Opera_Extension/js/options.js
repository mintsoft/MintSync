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
});

/** Set Save Preferences */
function savePrefs(){
	widget.preferences["ServerURL"] 	= $("#ServerURL").val();
	widget.preferences["SavePassword"]	= $("input[type=radio][name=SavePass]:checked").val();
	widget.preferences["Cipher"] 		= $("input[type=radio][name=Cipher]:checked").val();
	widget.preferences["KeyLength"] 	= $("input[type=radio][name=KeyLength]:checked").val();
}
	