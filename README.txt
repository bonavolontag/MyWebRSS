MyWebRSS
========
	html5.mywebrss.net
	api.mywebrss.net

PRESENTATION
------------
	MyWebRSS est un lecteur RSS web. Celui-ci est OpenSource et peut être installé sur n'importe quel serveur disposant de PHP et MySQL.
	
	Le client est codé en HTML5 + Javascript, pour permettre une utilisation sur les systèmes mobiles (iOS, Android, FirefoxOS) et Windows, Unix.
	
	L'API est développée en PHP et intéragit avec la base de données MySQL. Elle renvoit les données en JSON.

ORGANISATION DES FICHIERS
-------------------------
	www/
		index.html					page de présentation du service et divers liens (html5.*, api.*, marketplace)
	html5/
		js/
			app/
				...
			lib/
				require.js			Require.JS
				backbone.js			Backbone.JS
				underscore.js		Underscore.JS
				zepto.js			Zepto (JQuery-like)
			app.js
		css/
			style.css				la feuille de style
		images/
			...						toutes les images du style
		index.html					la page web HTML5
	api/
		signin.php					création d'un compte
		login.php					demande de connexion
		logout.php					déconnexion d'un compte
		listFeeds.php				récupère une liste des flux RSS
		showFeed.php				affiche un flux RSS
		addFeed.php					ajoute un flux RSS
		deleteFeed.php				supprime un flux RSS
		showUnread.php				affiche les articles non lus
		showArticle.php				affiche un article
		.htaccess
		conf.php					la configuration des scripts (connexion MySQL)
		lib.php						les fonctions communes
		index.html					Documentation sur l'API
	cron/
		backups/
			...						les divers sauvegardes de la base de données
		backup.php					effectue une sauvegarde de la base de données dans le dossiers backups/
		cleanFeeds.php				fait du ménage dans les flux RSS qui ne sont plus utilisés, et les articles trop vieux
		refreshFeeds.php			récupère les mises à jour des flux RSS
		cleanTokens.php				fait du ménage dans les Tokens qui ne sont plus utilisés (en fonction de la dernière requête)
		conf.php					la configuration des scripts (connexion MySQL)
		lib.php						les fonctions communes

API
---
	L'adresse api.mywebrss.net permet de récupérer des données au format JSON. Voici les URL (rewriting via .htaccess):
		URL Rewriting								|	Script			|	Etat	|	Paramètres
		------------------------------------------------------------------------------------------------------------------------------------------------------------
		http(s)://api.mywebrss.net/feed/list		->	listFeeds.php		OK			token (id)
								       /show		->	showFeed.php					token (id), feed (id), [page]
									   /add			->	addFeed.php			OK			token (id), feed (url)
									   /delete		->	deleteFeed.php					token (id), feed (id)
								  /article/unread	->	showUnread.php					token (id)
								          /show		->	showArticle.php					token (id), article (id)
								  /user/signin		->	signin.php			OK			email, password, confirm_password
								       /login		->	login.php			OK			email, password
								       /logout		->	logout.php			OK			token (id)
									   /password	->	changePassword.php				token (id), old_password, password, confirm_password
	La requête "login" permet de récupérer un Token de session. Ce Token est valable 30 jours si la session n'est pas déconnectée manuellement ("logout").
	A chaque requête (exceptées "signin" et "login"), l'envoi de ce Token est nécessaire, pour identifier l'utilisateur.
	
	L'utilisation d'une URL HTTPS permet de sécuriser l'envoi du mot de passe lors de la connexion, et l'envoi du Token à chaque requête.

CRON
----
	Voici les scripts à lancer périodiquement:
		Script					|	Périodicité		|	Etat
		-----------------------------------------------------------
		cleanFeeds.php				tous les jours			OK
		refreshFeeds.php			toutes les 5 minutes	OK
		cleanTokens.php				tous les jours			OK
		backup.php					tous les jours			OK

BASE DE DONNEES
---------------
	Schéma des tables
			tokens	>-------	user	-------<	user_feeds	>-------	 feeds	-------<	articles
	
	Détail des tables
		users			les infos des utilisateurs
				user_id					BIGINT(10)
				user_email				VARCHAR(255)
				user_pass				VARCHAR(40)		SHA-1 avec salt ("mywebrss")
				user_date				INT(10)			timestamp linux					=> éléments non lus depuis cette date
			=> user_id PRIMARY auto_increment
			=> user_email UNIQUE
		user_feeds		les flux RSS associés à chaque utilisateur
				user_ref				BIGINT(10)
				feed_ref				BIGINT(10)
			=> (user_ref, feed_ref) PRIMARY
			=> user_ref ON DELETE CASCADE ON UPDATE CASCADE
			=> feed_ref ON DELETE RESTRICT ON UPDATE CASCADE
		tokens			les tokens de chaque utilisateur
				token_id				VARCHAR(40)		random SHA-1 avec salt (token_date, user_ref)
				user_ref				BIGINT(10)
				token_date				INT(10)			timestamp linux
			=> token_id PRIMARY
			=> user_ref ON DELETE CASCADE ON UPDATE CASCADE
		feeds			les flux RSS
				feed_id					BIGINT(10)
				feed_url				VARCHAR(255)
				feed_title				VARCHAR(255)
				feed_description		TEXT
				feed_date				INT(10)			timestamp linux
			=> feed_id PRIMARY auto_increment
			=> feed_url UNIQUE
		articles		les articles de chaque flux RSS
				article_id				BIGINT(10)
				feed_ref				BIGINT(10)
				article_url				VARCHAR(255)
				article_guid			VARCHAR(255)
				article_title			VARCHAR(255)
				article_description		TEXT
				article_image			VARCHAR(255)
				article_date			INT(10)			timestamp linux
			=> article_id PRIMARY auto_increment
			=> feed_ref ON DELETE CASCADE ON UPDATE CASCADE
			=> article_url UNIQUE
			=> (feed_ref, article_guid) UNIQUE

TODO
----
	Les informations de ce document seront utilisées pour la beta. Pour que le service soit complet, il faudrait néanmoins ajouter:
		HTML5: importations d'une liste de flux RSS via un fichier OPML
		HTML5: gestion des langues
		API: création d'un système de clef pour les développeurs
		API: changement d'adresse email (avec confirmation par mail de la nouvelle adresse)
