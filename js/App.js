
var VERSION = "2.3.0";

// Modules
var util = require('util');
var fs = require('fs');
var path = require('path');
var http = require('http');
var https = require('https');
var urlParse = require('url').parse;
var AdmZip = require('adm-zip');
var EventEmitter = require('events').EventEmitter;

// Objects
var Log = require('./Log.js');
var Server = require('./Server.js');
var Tor = require('./Tor.js');
var Database = require('./Database.js');
var DeckBuilder = require('./DeckBuilder.js');

function App($, gui) {
	var self = this;	// Reference because "this" changes via context
	var win;			// node-webkit Window object
	var dir;			// Root directory of instalation
	var log;			// Log object for managing in-game user console
	var server;			// Server object for managing our HTTP server
	var db;				// Database object for getting cards
	var decks;			// DeckBuilder object for managing decks
	var tor;			// Tor object for handling the service
	var peerid;			// Our onion address for Tor
	var currentDeck;	// Deck the player has selected
	var commands;		// User commands loaded from the 'commands/' dir
	var settings;		// Simply settings.json loaded from conf dir

	EventEmitter.call(self);

	// Constructor
	function construct() {
		// Generate a random port to use locally
		var basePort = 1581 + (~~(Math.random() * 8000));

		// Find the root directory of this install
		self.dir = dir = fs.realpathSync(path.join(__dirname, '..'));

		// Load user settings early
		self.settings = settings = self.getJSON('conf', 'settings.json') || {};

		// Database for searching for cards
		self.db = db = new Database();

		// Save jQuery as the DOM
		self.dom = $;

		// Game console for user commands
		self.log = log = new Log(self);

		// Read all the commands from the commands dir
		self.commands = commands = loadCommandDir(path.join(dir, "commands"));

		// Load the MTG database
		db.load(self.getJSON('AllSets.json'));

		// DeckBuilder for managing user decks
		self.decks = decks = new DeckBuilder();
		decks.load(self.getConf('decks.json'));
		self.currentDeck = currentDeck = decks.getMostRecent();

		if (!currentDeck) {
			self.currentDeck = currentDeck = decks.createDeck();
		}

		// Server for receiving messages
		self.server = server = new Server(basePort);

		// Tor process
		self.tor = tor = new Tor({
			binary: self.getPath('tor', 'tor.exe'),
			dir: self.getPath('conf'),
			file: self.getPath('conf', 'tor.conf'),
			localPort: basePort,
			socksPort: basePort + 1,
			virtualPort: 1580,
		});

		self.tor.on('ready', finishTor);
	}

	// Entry point for the application
	self.load = function () {
		if (win) {
			console.log("[App] Warning trying to load while already loaded");
			return;
		}

		console.log("[App] Loading...");

		self.gui = gui;
		self.win = win = gui.Window.get();

		console.log("Window", self.win);

		$('title').text("Tabletop " + VERSION);
		win.title = "Tabletop " + VERSION;

		win.on('close', function () {
			self.stop();
			win.close(true);
		});

		log.start();
		server.start();
		tor.start();

		log.print("Thanks for testing!");

		self.checkUpdates();
	};

	self.changeDeck = function (deck) {
		if (!deck) {
			return;
		}

		self.currentDeck = currentDeck = deck;
		deck.lastUsed = Date.now();
		self.emit('deck-change');
	};

	self.modifyDeckCard = function (card, delta) {
		if (!card) {
			return;
		}

		if (card.multiverseid in currentDeck.cards) {
			currentDeck.cards[card.multiverseid] += delta;
		} else {
			currentDeck.cards[card.multiverseid] = delta;
		}

		if (currentDeck.cards[card.multiverseid] <= 0) {
			delete currentDeck.cards[card.multiverseid];
		}

		self.emit('deck-change');
	};

	self.saveSettings = function () {
		self.putConf('settings.json', self.settings);
	};

	self.saveDecks = function () {
		self.putConf('decks.json', self.decks.save());
	};

	// Stop all sub-processes
	self.stop = function () {
		self.saveDecks();
		self.saveSettings();

		server.stop();
		tor.stop();
		log.stop();
	};

	// Find a user command function by name
	self.findCommand = function (name) {
		return commands[name];
	};

	// Iterate through all of the user commands
	self.eachCommand = function (f) {
		Object.keys(commands).forEach(function (name) {
			f(commands[name]);
		});
	};

	// Read all the .js files in a directory and load them
	function loadCommandDir(dir) {
		var files = fs.readdirSync(dir);
		var map = {};

		for (var i=0; i < files.length; i++) {
			loadCommand(files[i], map);
		}

		return map;
	}

	// Load a .js file as a user command
	function loadCommand(file, map) {
		if (file.indexOf('.js') !== (file.length - 3)) {
			return;
		}

		console.log("[App] Loading command", file);

		var name = file.replace('.js', '');
		var command = require(path.join(dir, 'commands', file));

		if (!command) {
			console.log("[App] Warning command doesn't export a function", name);
			return;
		}

		command.name = command.name || name;
		map[name] = command;
	}

	// Compare two version strings like 1.2.3
	self.compareVersionStrings = function (a, b) {
		var diff;

		a = a || '';
		b = b || '';

		a = a.split('.');
		b = b.split('.');

		for (var i=0; i < 3; i++) {
			a[i] = ~~a[i];
			b[i] = ~~b[i];

			diff = b[i] - a[i];

			if (diff !== 0) {
				return diff;
			}
		}

		return 0;
	};

	// Gets a path
	self.getPath = function () {
		var x = path.join.apply(path, arguments);
		return path.join(dir, x);
	};

	self.getFileText = function () {
		var filepath = self.getPath.apply(self, arguments);

		if (!fs.existsSync(filepath)) {
			return;
		}

		return fs.readFileSync(filepath);
	};

	self.getFileJSON = function () {
		console.log("[Deprecated] getFileJSON");
		var text = self.getFileText.apply(self, arguments);
		return JSON.parse(text);
	};

	self.getJSON = function () {
		var filepath = self.getPath.apply(self, arguments);

		if (!fs.existsSync(filepath)) {
			return {};
		}

		return JSON.parse(fs.readFileSync(filepath));
	};

	self.getConf = function (name) {
		var filepath = self.getPath.apply(self, ['conf', name]);

		if (!fs.existsSync(filepath)) {
			return;
		}

		return JSON.parse(fs.readFileSync(filepath));
	};

	self.checkUpdates = function () {
		$.getJSON("https://api.github.com/repos/krisives/tabletop/tags", function (data) {
			console.log("[App] Update info", data);

			data = data || [];

			$.each(data, function (i, tag) {
				if (self.compareVersionStrings(VERSION, tag.name) > 0) {
					console.log("[App] A newer version is available");
					console.log("[App]", tag.zipball_url);

					if (window.confirm("Update to version " + tag.name + "?")) {
						self.performUpdate(tag);
					}

					return false;
				}
			});
		});
	};

	self.downloadFile = function (localPath, url, f) {
		var file = fs.createWriteStream(localPath);
		var request;
		var protocol;
		var requestOptions;

		if (url.indexOf('https:') === 0) {
			protocol = https;
		} else {
			protocol = http;
		}

		url = urlParse(url);

		requestOptions = {
			host: url.host,
			path: url.pathname,
			headers: {
				"User-Agent": "Tabletop"
			}
		};

		function createRequest() {
			return protocol.request(requestOptions, function (response) {
				//console.log(response);

				if (response.statusCode === 302 || response.statusCode === 301 || response.statusCode === 300) {
					url = urlParse(response.headers.location);
					requestOptions.host = url.host;
					requestOptions.path = url.path;

					request = createRequest();
					request.end();
					return;
				}

				response.on('end', function () {
					console.log('end');

					file.on('finish', function () {
						if (f) {
							f();
						}
					});

					file.end();
				});

				response.on('data', function (data) {
					console.log(data);
					file.write(data, 'binary');
				});
			});
		}

		request = createRequest();
		request.end();

		return request;
	};

	self.performUpdate = function (tag) {
		if (!tag || !tag.name || !tag.zipball_url) {
			console.log("Bad update info");
			return;
		}

		console.log("Downloading update...");

		var updatePath = self.getPath('updates', tag.name + ".zip");

		self.downloadFile(updatePath, tag.zipball_url, function () {
			console.log("Extracting update");

			var zip = new AdmZip(updatePath);
			var zipEntries = zip.getEntries();

			for (var i=0; i < zipEntries.length; i++) {
				if (zipEntries[i].isDirectory) {
					self.extractUpdate(zip, zipEntries[i]);
					return;
				}
			}

			console.log("Failed to apply update");
		});
	};

	self.extractUpdate = function (zip, entry) {
		zip.extractEntryTo(
			entry,
			dir,
			false,
			true
		);
	};

	// Write a JSON configuration file
	self.putConf = function (name, conf) {
		var filepath = self.getPath.apply(self, ['conf', name]);

		if (typeof conf !== 'string') {
			conf = JSON.stringify(conf);
		}

		fs.writeFileSync(filepath, conf);
	};

	// Run a user command
	self.command = function (text) {
		text = text || '';
		text = text.trim();

		if (text.length <= 0) {
			return;
		}

		if (text[0] !== '/') {
			return;
		}

		text = text.replace(/\s+/, ' ');
		var parts = text.split(' ');
		var command = parts[0];

		if (command === '/') {
			return;
		}

		command = command.substring(1);

		if (command.length <= 0) {
			return;
		}

		var f = commands[command];

		if (!f) {
			log.print("Unknown command '" + command + "'");
			return;
		}

		try {
			f(self, parts);
		} catch (error) {
			console.log(error);
			log.print("Error running command. See developer log");
		}
	};

	// Called when Tor is ready
	function finishTor() {
		console.log("[App] Tor is ready");

		// Read the hostname file generated by Tor and remove .onion
		peerid = String(self.getFileText('conf', 'hostname') || '');
		peerid = peerid.trim().replace('.onion', '');
		self.peerid = peerid;

		log.print("Your peer ID is " + peerid);

		// Screens like #host show your peer ID
		$('#host-peerid').text(peerid);

		var request = http.request({
			host: 'checkip.dyndns.com',
			port: 80,
			path: '/',
			agent: tor.createAgent()
		}, function (response) {
			response.on('data', function (text) {
				console.log(text.toString());
			});
		});

		request.end();
	}

	construct();

	return self;
}

util.inherits(App, EventEmitter);

module.exports = App;
