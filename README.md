MintSync
========
Eventually, this will be a multi-browser extension and server component secure password storage solution with all data decrypted clientside only.

Currently, a working Server (with client UI) and a Chromium extension exist (see the relevent branches).


Standard Installation - Server
================================

Please see the ServerUI Branch for instructions and the Server Component.

Frequently Asked Questions/Questions I Would Ask
==================================================

* Q: What the hell is this?
* A: It's a client and server application designed to store passwords securely for websites. Data is kept encrypted server-side and only ever decrypted by the client.

* Q: What ciphers/hashes are used and how large are your keys?
* A: Currently the only supported Cipher is AES and the only supported keylength is 256 bit. 
   Hashes are SHA-512 where applicable and SHA-256 when used as AES256 encryption keys.
   In the pipeline for some point is variable encryption or possibly parallel encryption, 
   depending on whether or not I decide it's worth the hassle.

* Q: Why is there only an Opera Extension? Don't you know that the cool kids all use Chrome/Firefox/Safari?
* A: I use Opera, I'm planning to add extensions for other browsers once I've finalised the extension and 
   done some refactoring

* Q: How does it work?
* A: The server maintains a list of URLS, Salts and "Credentials" information. The credentials information 
   is a Base64 encoded AES256 encrypted JSON object of Key=>Value pairs. 
   The encryption key for the credentials data is the master-key concatenated with the rowSalt. The 
   master-key is stored with the database (keySlot0 in the User table), however it is encrypted with 
   the SHA-256 of the password (which itself is a SHA-512 of the password the user enters).

* Q: Why on earth have you made this?
* A: A few weeks ago a colleague of mine recovered his password from some component of Tesco's 
   online services, which promptly sent his password back to him via email comprimising that 
   password in its entirety and everywhere its used. At this point he and I began discussing:
	a: how atrocious the security situation appears to be on the internet, 
	b: how poorly understood it is even by large companies,
	c: that the only way to limit the damage is to have totally unique passwords for each portal
   We then decided that its massively impractical to remember so many and yet neither of us have 
   confidence in other password solutions, both technically (as most are closed source) and physically
   (to look after my data).
	
* Q: Why not use Last Pass or one of the million alternative password storage solutions?
* A: Well, yes there are hundreds of "cloud password solutions" but when I have looked at each of 
   them they're all commercially motivated and as such are usually closed source. There are those who 
   will argue that closed source doesn't necessarily mean insecure, however I prefer being able to actually
   check myself. Not to mention that a large centralised password repository is a massive target for 
   potential theft. Other options I looked at all involved server-side password  decryption, and I wanted 
   something more easy to use from my browser of choice (Opera).

* Q: So why not use Opera Link if you're all about Opera?
* A: I did look seriously at Opera Link, however it is closed source and descriptions of exactly how it 
   works did not fill me with confidence, see: 
   (http://my.opera.com/operalink/blog/2011/05/03/security-of-synchronized-passwords-with-opera-link)
   as the Opera company as an entity has both my data and at instances my decryption key.

* Q: I need my own server?!
* A: Yes, or at least access to a server running Apache & PHP on which to host the Server Component. 
   SSL connectivity is not *strictly* required to keep the security of your credentials, however 
   it is highly recommended as an unencrypted connection can sniff your URL lists (giving a 
   potential attacker a hit-list to attack) and your login credentials (again the maximum damage 
   that could be done with this is deleting your passwords or retrieval of your URL lists, not compromise
   your actual passwords).

* Q: So how secure is this really?
* A: I'm yet to complete a comprehensive security review of everything but at the moment I'm thinking
   "pretty secure", especially if SSL is used.

* Q: Is there anything wrong that you know about?
* A: There are a few things I'm not totally happy with: 
	Ideally for stored credentials (encryption key et cetera) I would prefer to salt the hash before 
	storing it, this will probably be implemented at some point in the future with the salt stored 
	server-side.
    User feedback could really do with being improved, especially in situations where passwords are 
	incorrect.
	The authentication system is vulnerable to replay attacks if SSL is not used as the server does 
	not currently keep a list of nonces (coming soon).

* Q: Does it support X?
* A: Probably not, but I'm looking to add features where possible. 

* Q: Why is everything so grey and depressing?
* A: Because it's neutral and I'd rather go with something looking drab and boring than luminous!

* Q: What new features are you planning?
* A: New features I want to add pretty soon are:
	Two factor authentication using SSL Client Certificates	
	Alternative Browser Support
	Adding a non-superuser interface to the server to allow password viewing without a browser extension
	Possibly the ability to match both http and https in one URL
	
* Q: How do I use domain-level matching rather than exact URL & Querystring matches?
* A: Fuzzy URL matching is achieved using the sql LIKE syntax, when saving a URL either alter the URL 
    string to include % as a wildcard or rename the URL in the credentials list screen (double click 
	the URL) and add a %
	
	For example, Google accounts uses many different arguments depending on where you have been 
	redirected to the login page from however they all share https://accounts.google.com/ServiceLogin 
	as their root URL. Therefore saving credentials with the URL:
		https://accounts.google.com/ServiceLogin?%
	will allow you to retrieve them independent of the GET string.
	
	SQLite also supports the _ as a single character wildcard that is also supported. For more information
	see: http://www.sqlite.org/lang_expr.html#like
	
* Q: Why on earth do my URL encoded get strings get duplicated % signs? A %20 becomes %%20 when I add them!
* A: This is because the % is the wildcard character in SQL LIKE statements, therefore all occurances of 
    the % character to be treated as a literal need to be represented as %% in the database. In the 
	credentials list the data is displayed exactly as it is stored in the database, therefore a % is a 
	wildcard and %% is a '%' character.

* Q: Why doesn't it work with long URLs like the Amazon Web Service Login page?
* A: This is more than likely due to the PHP Suhosin module's get.max_value_length value which defaults to 
    256 characters, add/change your php config (/etc/php5/conf.d/suhosin.ini on Debian & Ubuntu) to include 
	the line
		suhosin.get.max_value_length = 2048
    and that should more than cover it.

* Q: Why does it keep auto updating every 3 days even when it doesn't need to!?
* A: This is due to me not understanding how the auto-update functionality works in Opera Extensions; 
    this was fixed in version 0.99.s
	
Libraries and Attributions
===========================

At current the following libraries are used:
jquery.js:				http://www.jquery.com

	Copyright (c) 2011 John Resig, http://jquery.com/

	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the
	"Software"), to deal in the Software without restriction, including
	without limitation the rights to use, copy, modify, merge, publish,
	distribute, sublicense, and/or sell copies of the Software, and to
	permit persons to whom the Software is furnished to do so, subject to
	the following conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
	LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
	OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

sha(1|256|512)?.js:		http://sourceforge.net/projects/jssha/files/

	Copyright (c) 2008-2010, Brian Turek
	All rights reserved.

	Redistribution and use in source and binary forms, with or without
	modification, are permitted provided that the following conditions are met:

	 * Redistributions of source code must retain the above copyright notice, this
	   list of conditions and the following disclaimer.
	 * Redistributions in binary form must reproduce the above copyright notice,
	   this list of conditions and the following disclaimer in the documentation
	   and/or other materials provided with the distribution.
	 * The names of the contributors may not be used to endorse or promote products
	   derived from this software without specific prior written permission.

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
	ANDANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	IMPLIEDWARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	DISCLAIMED.IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
	ANY DIRECT,INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING,BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	 LOSS OF USE,DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
	ANY THEORY OFLIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCEOR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISEDOF THE POSSIBILITY OF SUCH DAMAGE.

base64_decode.js: 		http://phpjs.org/functions/base64_decode:357

utf8_decode.js			http://phpjs.org/functions/utf8_decode:576

	/* 
	 * More info at: http://phpjs.org
	 * 
	 * This is version: 3.25
	 * php.js is copyright 2011 Kevin van Zonneveld.
	 * 
	 * Portions copyright Brett Zamir (http://brett-zamir.me), Kevin van Zonneveld
	 * (http://kevin.vanzonneveld.net), Onno Marsman, Theriault, Michael White
	 * (http://getsprink.com), Waldo Malqui Silva, Paulo Freitas, Jonas Raoni
	 * Soares Silva (http://www.jsfromhell.com), Jack, Philip Peterson, Legaev
	 * Andrey, Ates Goral (http://magnetiq.com), Ratheous, Alex, Rafal Kukawski
	 * (http://blog.kukawski.pl), Martijn Wieringa, lmeyrick
	 * (https://sourceforge.net/projects/bcmath-js/), Nate, Enrique Gonzalez,
	 * Philippe Baumann, Webtoolkit.info (http://www.webtoolkit.info/), Jani
	 * Hartikainen, Ole Vrijenhoek, Ash Searle (http://hexmen.com/blog/), Carlos
	 * R. L. Rodrigues (http://www.jsfromhell.com), travc, Michael Grier,
	 * Erkekjetter, Johnny Mast (http://www.phpvrouwen.nl), Rafal Kukawski
	 * (http://blog.kukawski.pl/), GeekFG (http://geekfg.blogspot.com), Andrea
	 * Giammarchi (http://webreflection.blogspot.com), WebDevHobo
	 * (http://webdevhobo.blogspot.com/), d3x, marrtins,
	 * http://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hex-in-javascript,
	 * pilus, stag019, T.Wild, Martin (http://www.erlenwiese.de/), majak, Marc
	 * Palau, Mirek Slugen, Chris, Diplom@t (http://difane.com/), Breaking Par
	 * Consulting Inc
	 * (http://www.breakingpar.com/bkp/home.nsf/0/87256B280015193F87256CFB006C45F7),
	 * gettimeofday, Arpad Ray (mailto:arpad@php.net), Oleg Eremeev, Josh Fraser
	 * (http://onlineaspect.com/2007/06/08/auto-detect-a-time-zone-with-javascript/),
	 * Steve Hilder, mdsjack (http://www.mdsjack.bo.it), Kevin van Zonneveld
	 * (http://kevin.vanzonneveld.net/), gorthaur, Aman Gupta, Sakimori, Joris,
	 * Robin, Kankrelune (http://www.webfaktory.info/), Alfonso Jimenez
	 * (http://www.alfonsojimenez.com), David, Felix Geisendoerfer
	 * (http://www.debuggable.com/felix), Lars Fischer, Karol Kowalski, Imgen Tata
	 * (http://www.myipdf.com/), Steven Levithan (http://blog.stevenlevithan.com),
	 * Tim de Koning (http://www.kingsquare.nl), Dreamer, AJ, Paul Smith, KELAN,
	 * Pellentesque Malesuada, felix, Michael White, Mailfaker
	 * (http://www.weedem.fr/), Thunder.m, Tyler Akins (http://rumkin.com),
	 * saulius, Public Domain (http://www.json.org/json2.js), Caio Ariede
	 * (http://caioariede.com), Steve Clay, David James, madipta, Marco, Ole
	 * Vrijenhoek (http://www.nervous.nl/), class_exists, T. Wild, noname, Arno,
	 * Frank Forte, Francois, Scott Cariss, Slawomir Kaniecki, date, Itsacon
	 * (http://www.itsacon.net/), Billy, vlado houba, Jalal Berrami,
	 * ReverseSyntax, Mateusz "loonquawl" Zalega, john (http://www.jd-tech.net),
	 * mktime, Douglas Crockford (http://javascript.crockford.com), ger, Nick
	 * Kolosov (http://sammy.ru), Nathan, nobbler, Fox, marc andreu, Alex Wilson,
	 * Raphael (Ao RUDLER), Bayron Guevara, Adam Wallner
	 * (http://web2.bitbaro.hu/), paulo kuong, jmweb, Lincoln Ramsay, djmix,
	 * Pyerre, Jon Hohle, Thiago Mata (http://thiagomata.blog.com), lmeyrick
	 * (https://sourceforge.net/projects/bcmath-js/this.), Linuxworld, duncan,
	 * Gilbert, Sanjoy Roy, Shingo, sankai, Oskar Larsson H�gfeldt
	 * (http://oskar-lh.name/), Denny Wardhana, 0m3r, Everlasto, Subhasis Deb,
	 * josh, jd, Pier Paolo Ramon (http://www.mastersoup.com/), P, merabi, Soren
	 * Hansen, EdorFaus, Eugene Bulkin (http://doubleaw.com/), Der Simon
	 * (http://innerdom.sourceforge.net/), echo is bad, JB, LH, kenneth, J A R,
	 * Marc Jansen, Stoyan Kyosev (http://www.svest.org/), Francesco, XoraX
	 * (http://www.xorax.info), Ozh, Brad Touesnard, MeEtc
	 * (http://yass.meetcweb.com), Peter-Paul Koch
	 * (http://www.quirksmode.org/js/beat.html), Olivier Louvignes
	 * (http://mg-crea.com/), T0bsn, Tim Wiel, Bryan Elliott, nord_ua, Martin, JT,
	 * David Randall, Thomas Beaucourt (http://www.webapp.fr), Tim de Koning,
	 * stensi, Pierre-Luc Paour, Kristof Coomans (SCK-CEN Belgian Nucleair
	 * Research Centre), Martin Pool, Kirk Strobeck, Rick Waldron, Brant Messenger
	 * (http://www.brantmessenger.com/), Devan Penner-Woelk, Saulo Vallory, Wagner
	 * B. Soares, Artur Tchernychev, Valentina De Rosa, Jason Wong
	 * (http://carrot.org/), Christoph, Daniel Esteban, strftime, Mick@el, rezna,
	 * Simon Willison (http://simonwillison.net), Anton Ongson, Gabriel Paderni,
	 * Marco van Oort, penutbutterjelly, Philipp Lenssen, Bjorn Roesbeke
	 * (http://www.bjornroesbeke.be/), Bug?, Eric Nagel, Tomasz Wesolowski,
	 * Evertjan Garretsen, Bobby Drake, Blues (http://tech.bluesmoon.info/), Luke
	 * Godfrey, Pul, uestla, Alan C, Ulrich, Rafal Kukawski, Yves Sucaet,
	 * sowberry, Norman "zEh" Fuchs, hitwork, Zahlii, johnrembo, Nick Callen,
	 * Steven Levithan (stevenlevithan.com), ejsanders, Scott Baker, Brian Tafoya
	 * (http://www.premasolutions.com/), Philippe Jausions
	 * (http://pear.php.net/user/jausions), Aidan Lister
	 * (http://aidanlister.com/), Rob, e-mike, HKM, ChaosNo1, metjay, strcasecmp,
	 * strcmp, Taras Bogach, jpfle, Alexander Ermolaev
	 * (http://snippets.dzone.com/user/AlexanderErmolaev), DxGx, kilops, Orlando,
	 * dptr1988, Le Torbi, James (http://www.james-bell.co.uk/), Pedro Tainha
	 * (http://www.pedrotainha.com), James, Arnout Kazemier
	 * (http://www.3rd-Eden.com), Chris McMacken, Yannoo, jakes, gabriel paderni,
	 * FGFEmperor, Greg Frazier, baris ozdil, 3D-GRAF, daniel airton wermann
	 * (http://wermann.com.br), Howard Yeend, Diogo Resende, Allan Jensen
	 * (http://www.winternet.no), Benjamin Lupton, Atli ��r, Maximusya, davook,
	 * Tod Gentille, Ryan W Tenney (http://ryan.10e.us), Nathan Sepulveda, Cord,
	 * fearphage (http://http/my.opera.com/fearphage/), Victor, Rafal Kukawski
	 * (http://kukawski.pl), Matteo, Manish, Matt Bradley, Riddler
	 * (http://www.frontierwebdev.com/), Alexander M Beedie, T.J. Leahy, Rafal
	 * Kukawski, taith, Luis Salazar (http://www.freaky-media.com/), FremyCompany,
	 * Rival, Luke Smith (http://lucassmith.name), Andrej Pavlovic, Garagoth, Le
	 * Torbi (http://www.letorbi.de/), Dino, Josep Sanz (http://www.ws3.es/), rem,
	 * Russell Walker (http://www.nbill.co.uk/), Jamie Beck
	 * (http://www.terabit.ca/), setcookie, Michael, YUI Library:
	 * http://developer.yahoo.com/yui/docs/YAHOO.util.DateLocale.html, Blues at
	 * http://hacks.bluesmoon.info/strftime/strftime.js, Ben
	 * (http://benblume.co.uk/), DtTvB
	 * (http://dt.in.th/2008-09-16.string-length-in-bytes.html), Andreas, William,
	 * meo, incidence, Cagri Ekin, Amirouche, Amir Habibi
	 * (http://www.residence-mixte.com/), Kheang Hok Chin
	 * (http://www.distantia.ca/), Jay Klehr, Lorenzo Pisani, Tony, Yen-Wei Liu,
	 * Greenseed, mk.keck, Leslie Hoare, dude, booeyOH, Ben Bryan
	 * 
	 * Dual licensed under the MIT (MIT-LICENSE.txt)
	 * and GPL (GPL-LICENSE.txt) licenses.
	 * 
	 * Permission is hereby granted, free of charge, to any person obtaining a
	 * copy of this software and associated documentation files (the
	 * "Software"), to deal in the Software without restriction, including
	 * without limitation the rights to use, copy, modify, merge, publish,
	 * distribute, sublicense, and/or sell copies of the Software, and to
	 * permit persons to whom the Software is furnished to do so, subject to
	 * the following conditions:
	 * 
	 * The above copyright notice and this permission notice shall be included
	 * in all copies or substantial portions of the Software.
	 * 
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
	 * IN NO EVENT SHALL KEVIN VAN ZONNEVELD BE LIABLE FOR ANY CLAIM, DAMAGES
	 * OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
	 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
	 * OTHER DEALINGS IN THE SOFTWARE.
	 */ 

Sizzle Selector Engine:

	/*!
	 * Sizzle CSS Selector Engine
	 *  Copyright 2011, The Dojo Foundation
	 *  Released under the MIT, BSD, and GPL Licenses.
	 *  More information: http://sizzlejs.com/
	 */
	 
AES:
SlowAES: http://code.google.com/p/slowaes/ Apache version 2.0

json2.js:     http://www.JSON.org/json2.js

jquery.tools.min.1.2.5.js: 		http://flowplayer.org/tools/

REST utils: Originally http://www.gen-x-design.com/archives/create-a-rest-api-with-php/
	
Icons: Creative Commons 3.0: http://www.fatcow.com/free-icons
	
GET String parameter parsing in JS: Thanks to Nathan Campos; http://stackoverflow.com/questions/901115/get-query-string-values-in-javascript

handlebars.js : MIT license : http://handlebarsjs.com/

jquery-autobars: ? : https://github.com/cultofmetatron/jquery-autobars

jquery-qrcode: MIT license : https://github.com/jeromeetienne/jquery-qrcode

Mousetrap: Apache-2: https://github.com/ccampbell/mousetrap
