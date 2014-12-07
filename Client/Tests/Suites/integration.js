QUnit.asyncTest("The Server API can return a list of URLS correctly", function (assert) {
	assert.expect(3);
	$MS.listURLS({
		error: function(jq,textStatus,errorThrown) {
			assert.equal(1,0,"list URLS has failed: " + errorThrown)
			QUnit.start();
		},
		success: function(data){
			assert.equal(data.status, "ok");
			assert.equal(data.action, "list");
			assert.ok(data.data[0].URL != false);
			QUnit.start();
		}
	});
});

QUnit.asyncTest("The client can retrieve the credentials object for an URL that exists", function (assert) {
	assert.expect(6);
	$MS.listURLS({
		error: function(jq,textStatus,errorThrown) {
			assert.equal(1,0,"list URLS has failed: this has failed: " + errorThrown)
			QUnit.start();
		},
		success: function(data){
			assert.equal(data.status, "ok");
			assert.equal(data.action, "list");
			var testUrl = data.data[0].URL;

			$MS.getPasswords(testUrl,{
				error: function(jq,textStatus,errorThrown) {
					assert.equal(1,0,"getPasswords has failed:" + errorThrown)
					QUnit.start();
				},
				success: function(response){
					assert.equal(response.status, "ok");
					assert.equal(response.action, "retrieve");
					assert.ok(response.data.Salt);
					assert.ok(response.data.Credentials);
					QUnit.start();
				}
			});
		}
	});
});

QUnit.asyncTest("The client can decrypt the credentials object for an URL", function (assert) {
	assert.expect(9);
	$MS.listURLS({
		error: function(jq,textStatus,errorThrown) {
			assert.equal(1,0,"list URLS has failed: this has failed: " + errorThrown);
			QUnit.start();
		},
		success: function(data){
			assert.equal(data.status, "ok");
			assert.equal(data.action, "list");
			var testUrl = data.data[0].URL;

			$MS.getPasswords(testUrl,{
				error: function(jq,textStatus,errorThrown) {
					assert.equal(1,0,"getPasswords has failed:" + errorThrown);
					QUnit.start();
				},
				success: function(response){
					assert.equal(response.status, "ok");
					assert.equal(response.action, "retrieve");
					assert.ok(response.data.Salt);
					assert.ok(response.data.Credentials);
					assert.equal(0,response.data.cryptoScheme);

					var	base64decoded = base64_decode(response.data.Credentials);
					var rowSalt = response.data.Salt;
					var keySlot = response.data.keySlot0;

					var passwordHash = $MS.hashPass("myverysecurepassword");

					var mc_callbacks = {
						success: function(credentialsObj) {
							assert.ok(credentialsObj.Username && credentialsObj.Username != "");
							assert.ok(credentialsObj.Password && credentialsObj.Password != "");
							QUnit.start();
						},
						error: function(){
							assert.equal(1,0,"FAIL: Error in decode and decrypt! ");
							QUnit.start();
						}
					};

					$MC.handleDecodeAndDecrypt(passwordHash, rowSalt, keySlot, base64decoded, mc_callbacks, 0);
				}
			});
		}
	});
});
/*
QUnit.asyncTest("The client can save and decrypt the credentials object for an URL", function (assert) {
	assert.expect(9);
	// this.setPassword = function(Domain,Credentials,rowSalt,cryptoHash,force,callbacks) {
	var testDomain = "test_"+Date.now();
	var credentials = { };
	var rowSalt = $MS.generateRowSalt();
	var cryptoPassword = $MS.generatePassword(16);
	$MC.encodeAndEncrypt(CredentialsObj,RowSalt,returnedData.data.keySlot0,function(encryptedData,cryptoHash) {
		$MS.setPassword(testDomain, credentials, rowSalt, cryptoPassword, true, {
			error : function(e) {
				assert.equal(1,0, "error in setPassword : " + e);
			},
			success: function(response)
			{

			}
		});
	});
});
*/