QUnit.asyncTest("The Server API can return a list of URLS correctly", function (assert) {
	$MS.listURLS({
		error: function(jq,textStatus,errorThrown) {
			assert.equal(1,0,"list URLS has failed: this has failed: " + errorThrown)
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
/*
QUnit.asyncTest("The client can decrypt a URL that exists", function (assert) {
	$MS.listURLS({
		error: function(jq,textStatus,errorThrown) {
			assert.equal(1,0,"list URLS has failed: this has failed: " + errorThrown)
			QUnit.start();
		},
		success: function(data){
			assert.equal(data.status, "ok");
			assert.equal(data.action, "list");
			var testUrl = data.data[0].URL;











			QUnit.start();
		}
	});
});
*/