/** Hex to String and viceVersa functions

	Borrowed from: http://www.webdeveloper.com/forum/showthread.php?t=204165
	then fixed to make it actually work
*/
function hexObj() {
	this.dec2hexChar = function(d){
		return d.toString(16);
	},
	this.hex2decChar = function(h){
		return parseInt(h,16);
	},
	this.Str2Hex = function (srcStr){
		var str = '';
		for (var i=0; i<srcStr.length; i++) 
		{
			c = srcStr.charCodeAt(i);
			str += this.dec2hexChar(c) + '';
		}
		return str;
	},
	this.Hex2Str = function (srcStr){
		var str = '';
		for (var i=0; i<srcStr.length; i+=2) 
		{
			c = String.fromCharCode(this.hex2decChar(srcStr[i]+""+srcStr[i+1]));
			str += c;
		}
		return str;
	}
};

/**
	creates a SHA hash
*/
function doHash(passwd,type)
{
	var shaObj = new jsSHA(passwd, "ASCII");
	return shaObj.getHash(type, "HEX");
}

/** Generates the Master Key - Binary string */
function generateMasterKey()
{
		var length = 64,	//512Bit
			passwd="",
			myHexObj = new hexObj();
			
		for(var x=0;x<length;++x)
		{
			var index = Math.floor(Math.random()*256)%256;	//ensure it doesn't overflow
			passwd += String.fromCharCode(index);
		}
		
		return passwd;
}

function AESencrypt(text, key)
{
	return Aes.Ctr.encrypt(text, key, 256);
}

/**
	jQuery entrypoint
*/
$(document).ready(function(){
	$("#adduser").submit(function(){
		var passwd = "", 
			cryptopasswd = "",
			masterKey = "",
			keySlot0CryptoKey="",
			keySlot0="",
			myHexObj = new hexObj();
		
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
		passwd = doHash($("#password1").val(),"SHA-512");
		
		if($("#cryptopassword1").val()!==$("#cryptopassword2").val())
		{
			return false;
		}
		
		masterKey = doHash($("#cryptopassword1").val(),"SHA-512");
		cryptopasswdVerifyHash	= 	doHash(masterKey,"SHA-512");
		keySlot0CryptoKey 		= 	myHexObj.Hex2Str(doHash(masterKey,"SHA-256"));
		
		keySlot0 = generateMasterKey();					//keySlot decryption key
		keySlot0 = AESencrypt(keySlot0,keySlot0CryptoKey);	//encrypt with the master password
		
		console.log("Sending Add User Request");
		//ajax and add the user
		$.ajax({
			url: 'adduser.php',
			type: 'POST',
			data: {
				'username' : 		$("#username").val(),
				'password' : 		passwd,
				'cryptopassword' : 	cryptopasswdVerifyHash,
				'keySlot0': 		keySlot0
			},
			beforeSend: function(){
				$("#adduser").hide();
			},
			success: function(data, textStatus, jq){
				alert("Success!");
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