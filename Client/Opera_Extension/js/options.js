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
	
	/* generation options */
	widget.preferences["passwordStrengthNum"]		= $("#passwordStrengthNum").is(":checked");
	widget.preferences["passwordStrengthPunc1"]		= $("#passwordStrengthPunc1").is(":checked");
	widget.preferences["passwordStrengthPunc2"]		= $("#passwordStrengthPunc2").is(":checked");
	
	if(widget.preferences["SavePassword"]!=1)
	{
		widget.preferences["SavedPassword"]=undefined;
	}
}
	