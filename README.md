MintSync - Mintsoft (Rob Emery) 2011
====================================
This is the PHP REST Server component including a rudementary Server UI to access the encrypted passwords (all crypto is performed in JS, client side) and should maintain some level of Opera Mini, Safari on iPhone and Android Browser compatibility (hopefully!).

================================
 Standard Installation - Server
================================
1. Acquire a copy of the Server component and extract the server component into your webroot (i.e. download as zip from github or if you're living dangerously: <code>git clone --branch ServerUI https://github.com/mintsoft/MintSync.git /var/wwws/mypasswords/</code>)
2. Pick a location (preferrably outside of your www-root) and use sqlite3 to create a new database (sqlite3 passwords.db) and load the schema (<code>.read /var/wwws/mypasswords/sqliteSchema.txt</code>)
3. Ensure the webserver user can write to the database and the containing folder. 
    (for example: <code>chgrp www-data passwords.db . && chmod g+w passwords.db .</code>)
4. Edit <code>config.php</code> and set <code>PASSWORD_DATABASE</code> to the absolute path to your database and check that 
    <code>SERVER_UI_LOCKED</code> is <code>false</code>
5. Point your browser to the server location (https://example.com/mypasswords) and add your user.
6. Enter your first user's details and click the submit button. Your new user should be set-up. 

***
You may add more users now, however once complete it is very important that you remember to set <code>SERVER_UI_LOCKED</code> to <code>true</code> in <code>config.php</code>
***

Notice: It would absolutely be a good idea to backup your password database reguarly (I use Amazon S3 + s3cmd to backup every night).

For more information see the README.md in master