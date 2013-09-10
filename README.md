MyWebRSS
========
www.mywebrss.net

html5.mywebrss.net

api.mywebrss.net

PRESENTATION
------------
MyWebRSS is a web RSS reader. It is OpenSource and can be installed on every server with PHP and MySQL.

The client side is HTML5 + Javascript, for the best compatibility on mobiles platforms (iOS, Android, FirefoxOS) and desktop computers.

The API is developped in PHP and uses a MySQL database. The datas send are in JSON.

INSTALLATION
------------
The **html5/** folder needs to be placed in a web server (no need of PHP). The URL of the API needs to be set in the **window.mywebrss** variable, in **js/app/main.js** file.

The database can be created using the **mywebrss.sql** file.

The **api/** and **cron/** need a PHP server. The configuration of the MySQL database needs to be set in the **conf.php** file in each folder.

If your **api/** server doesn't use SSL, you may want to comment this lines in **api/.htaccess**:

	RewriteCond %{SERVER_PORT} 80 
	RewriteRule ^(.*)$ https://%{SERVER_NAME}%{REQUEST_URI} [R,L]

To use the **cron/backup.php** script, you have to set your **mysqldump** executable path in **cron/conf.php**:

	$mysqldump = "/opt/lampp/bin/mysqldump";

The client can be installed in Firefox products with the page **html5/install.html**. The manifest path needs to be set:

	var manifestUrl = 'http://html5.mywebrss.net/manifest.webapp';

If you are running the API from Windows, CURL won't verify the SSL certificate. You will need to disable the check by turning the line from **api/lib.persona.php**:

	curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, true);

to this:

	curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);

or follow this: https://github.com/mozilla/browserid-cookbook/blob/master/php/README.windows.txt

API
---
The api.mywebrss.net address offers the hability to get datas in JSON. These are the URL (rewriting with .htaccess):
	
	URL											|	Request parameters										|	Result variables
	----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	http(s)://api.mywebrss.net/feed/add				token (id), feed (url)										success, [error], feed (id)
								   /delete			token (id), feed (id)										success, [error]
								   /import			token (id), file (opml content)								success, [error], percentage (of added feeds)
							       /list			token (id)													success, [error], result { id, title, description, error (0 or 1), unread (articles count) }
							       /show			token (id), feed (id), [articles_count], [page]				success, [error], feed (title), result { id, title, description, url, image, date, feed (title), status ("" or "new" }
							  /article/unread		token (id), article (id)									success, [error]
							  /user/login			assertion (personna)										success, [error], token
							       /logout			token (id)													success, [error]

If the **success** variable returned is set to 0, the **error** variable indicate the reason of failure (the name of the parameter of the request, or a full sentence).

The **result** variable, if present, is an array and includes the variables shown between the {}.

For each request, the Token is needed, to identify the user. The request **/user/login** checks the Persona assertion and returns the email address associated with it, and generate a token.

The use of HTTPS allow more secure exchanges, for the sending of the the Token.

CRON
----
This scripts need to be launch periodically (using crontab for example):
	
	Script					|	Frequency		|	Description
	----------------------------------------------------------------------------------------------------------
	backup.php					every day			dump the database
	cleanArticles.php			every day			delete old articles (30 days for example)
	cleanFeeds.php				every day			delete unused and wrong feeds
	cleanTokens.php				every day			delete old Tokens
	cleanUsers.php				every day			delete inactive users
	refreshFeeds.php			every minutes		refresh articles for feeds (get new datas every 5 minutes)

DATABASE
--------
The database uses MySQL with InnoDB.

Scheme
		
		tokens	>-------	users	-------<	user_feeds	>-------	 feeds	-------<	articles
		
		users	-------<	user_articles	>-------	 articles

Detail
	
	users			users informations
			user_id					BIGINT(10)
			user_email				VARCHAR(255)
			user_lastlogin			INT(10)			linux timestamp
		=> user_id PRIMARY auto_increment
		=> user_email UNIQUE
	tokens      Tokens of each users
			token_id				VARCHAR(40)		random SHA-1 with salt (token_date, user_ref)
			user_ref				BIGINT(10)
			token_date				INT(10)			linux timestamp
		=> token_id PRIMARY
		=> user_ref ON DELETE CASCADE ON UPDATE CASCADE
	user_feeds		RSS feeds used by each users
			user_ref				BIGINT(10)
			feed_ref				BIGINT(10)
		=> (user_ref, feed_ref) PRIMARY
		=> user_ref ON DELETE CASCADE ON UPDATE CASCADE
		=> feed_ref ON DELETE CASCADE ON UPDATE CASCADE
	feeds			RSS feeds
			feed_id					BIGINT(10)
			feed_url				VARCHAR(255)
			feed_title				VARCHAR(255)
			feed_description		TEXT
			feed_date				INT(10)			linux timestamp
			feed_error				INT(10)			linux timestamp
		=> feed_id PRIMARY auto_increment
		=> feed_url UNIQUE
	articles		articles of each RSS feeds
			article_id				BIGINT(10)
			feed_ref				BIGINT(10)
			article_url				VARCHAR(255)
			article_guid			VARCHAR(255)
			article_title			VARCHAR(255)
			article_description		TEXT
			article_image			VARCHAR(255)
			article_date			INT(10)			linux timestamp
		=> article_id PRIMARY auto_increment
		=> feed_ref ON DELETE CASCADE ON UPDATE CASCADE
		=> article_url UNIQUE
		=> (feed_ref, article_guid) UNIQUE
	user_articles	articles state for each users (read or not)
			user_ref				BIGINT(10)
			article_ref				BIGINT(10)
		=> (user_ref, article_ref) PRIMARY
		=> user_ref ON DELETE CASCADE ON UPDATE CASCADE
		=> article_ref ON DELETE CASCADE ON UPDATE CASCADE

TODO
----
Informations in this document will be implemented in beta version. For the service to be usefull, this could be added:
* language support
* adding a share button (Twitter, Facebook)
* add a developper key system for the API
* change the email address (with confirmation email sent)
* delete the account
