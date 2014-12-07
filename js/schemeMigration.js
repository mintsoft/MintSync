var g_serverURL;
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

	setupLightboxes();
	$MS.listURLS({
		beforeSend: function() {
			$("#matrixLoading").fadeIn(0);
		},
		complete: function() {
			$("#matrixLoading").fadeOut(0);
		},
		error: function(jq,textStatus,errorThrown) {
			switch(jq.status)
			{
				case 401:	//incorrect login
					alert("List URLs failed due to incorrect Login, please try again");
				break;
				default:
					alert("An error occurred whilst listing URLs, this is probably due to not having any saved credentials. See the error console for more information");
					console.error("You have reached an undefined state ("+jq.status+" "+textStatus+"): " + errorThrown);
			}
		},
		success: function(requestdata,textStatus,jq) {
			//create list of domains
			updatePasswordMatrix(requestdata.data);
		}
	});

	$("#recrypt").click(function(e){
		e.preventDefault();
		
		$("#PasswordList li").each(function(){
			processRecord(this);
		});
	});
});

function processRecord(record)
{
	var id = $(record).find("div.dropDownContent input").val();
	var domainName = $(record).find("h3").text();
	console.log(id + ": " + domainName);

	$MS.getEncryptionPasswordHash(function(passwordHash){
		//get using old mechanism
		$MS.getPasswordsByID(id,{
			success: function(requestdata, textStatus, jq) {
				if(requestdata.data.cryptoScheme == 1)
					return;
				var rowSalt = requestdata.data.Salt,
					keySlot = requestdata.data.keySlot0,
					base64decoded = base64_decode(requestdata.data.Credentials);

				$MC.handleDecodeAndDecrypt(passwordHash, rowSalt, keySlot, base64decoded, requestdata.data.cryptoScheme, {
					success: function(CredentialsObj) {
						//Save using new scheme
						var newCryptoScheme = 1;
						$MC.encodeAndEncrypt(CredentialsObj, rowSalt, keySlot, newCryptoScheme, function(encryptedData, cryptoHash) {
							CredentialsObj = {};

							$MS.setPassword(domainName, encryptedData, rowSalt, cryptoHash, true, {
								error: function(jq,textStatus,errorThrown) {
									$(record).find("span.status").addClass("borderred");

									switch(jq.status)
									{
										case 401:
											$(record).find("span.status").text("Save Failed: Incorrect Login, please try again");
											break;
										case 409:
											$(record).find("span.status").text("Save Failed: This URL Already exists");
											break;
										case 417:
											$(record).find("span.status").text("Save Failed: Inconsistent Crypto Password");
											//update the saved crypto password if it is set to anything other than no
											$MS.resetSavedCryptoPassword();
											break;
										default:

											$(record).find("span.status").text("An undefined error has occurred, see the error console for more information");
											console.error("An Error Occurred:" + textStatus + "\n" + errorThrown+"\n"+jq.responseText);
											console.error(jq);
									}
								},
								success: function(requestdata,textStatus,jq) {
									$(record).find("span.status").addClass("bordergreen");
								}
							});
						});

					},
					error: function(){
						alert("That decryption password is incorrect. Please try again");
						$MS.resetSavedCryptoPassword();
					}
				},0);
			},
			beforeSend: function() {},
			complete: function(jq,textStatus,errorThrown) {},
			error: function(jq,textStatus,errorThrown){
				switch(jq.status)
				{
					case 401:	//incorrect login
						alert("Retrieve failed due to incorrect Login, please try again");
						break;
					default:
						alert("An Error Has Occurred, see the error console for more information");
						console.error("An unexpected error has occurred ("+jq.status+" "+textStatus+"): " + errorThrown);
				}
			}
		});
	});
}

function updatePasswordMatrix(sourceArray)
{
	//copy template for each password
	var target	= document.getElementById("PasswordList");
	
	for(var x in sourceArray)
	{
		var	tmpObj = $("<li>\
			<h3 unselectable='on' class='' ></h3>\
			<span class='status'></span><div class='dropDownContent hidden'>\
				<input type='hidden' name='ID' />\
			</div>\
		</li>");
		
		$(tmpObj).find("h3").text(sourceArray[x].URL);
		$(tmpObj).find("input[type='hidden']").val(sourceArray[x].ID);
		
		$(target).append(tmpObj);
	}
	
	$(target).fadeIn(0);
}