QUnit.asyncTest("The Server API can return a list of URLS correctly", function (assert) {
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

					
					QUnit.start();
				}
			});
		}
	});
});
