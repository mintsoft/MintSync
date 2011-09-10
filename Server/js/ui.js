/**
	creates a SHA512 hash
*/
function doHash(passwd)
{
	var shaObj = new jsSHA(passwd, "ASCII");
	return shaObj.getHash("SHA-512", "HEX");
}

/**
	jQuery entrypoint
*/
$(document).ready(function(){
	$("#adduser").submit(function(){
		var passwd = "", 
			cryptopasswd = "";
		
		if(	$("#password1").val()==="" ||
			$("#password2").val()==="" ||
			$("#cryptopassword1").val()==="" ||
			$("#cryptopassword2").val()==="" ||
			$("#username").val()==="" )
			return false;
		
		if($("#password1").val()!==$("#password2").val())
		{
			return false;
		}
		passwd = doHash($("#password1").val());
		
		if($("#cryptopassword1").val()!==$("#cryptopassword2").val())
		{
			return false;
		}
		cryptopasswd = doHash(doHash($("#cryptopassword1").val()));
		
		console.log("Sending Add User Request");
		//ajax and add the user
		$.ajax({
			url: 'adduser.php',
			type: 'POST',
			data: {
				'username' : $("#username").val(),
				'password' : passwd,
				'cryptopassword' : cryptopasswd
			},
			beforeSend: function(){
				$("#adduser").hide();
				
			},
			success: function(data, textStatus, jq){
				console.log(data);
			},
			error: function(jq,textStatus,errorThrown){
				alert("There was an error! See the console for more information");
				console.log(jq);
				console.log(textStatus);
				console.log(errorThrown);
			},
			complete: function(){
				$("#adduser").show();
				$("input").val("");
			}
		});
		
	});
});