
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var spawn = require('child_process').spawn;
var fs = require('fs');
var ProxySocket = require('ProxySocket');
var http = require('http');

function Tor(conf) {
	var self = this;
	var process;
	var output = '';

	console.log("[TOR]", conf);

	if (!conf) {
		throw "Must pass a Tor configuration object";
	}

	conf.binary = conf.binary || '';
	conf.dir = conf.dir || '';
	conf.file = conf.file || '';
	conf.socksPort = (~~conf.socksPort);
	conf.localPort = (~~conf.localPort);
	conf.virtualPort = (~~conf.virtualPort);

	self.socksPort = conf.socksPort;
	self.localPort = conf.localPort;
	self.virtualPort = conf.virtualPort;

	EventEmitter.call(self);

	self.start = function () {
		if (process) {
			return;
		}

		fs.writeFileSync(conf.file, self.getSettingsText());

		output = '';
		process = spawn(conf.binary, ['-f', conf.file]);
		
		process.stdout.on('data', function (text) {
			console.log("[TOR] [stdout]", text.toString());
			output = output + text.toString();

			if (output.indexOf("Bootstrapped 100%") !== -1) {
				self.emit('ready');
				output = '';
			}
		});

		process.stderr.on('data', function (text) {
			console.log("[TOR] [stderr]", text.toString());
		});

		process.on('close', function (code) {
			console.log("[TOR] Process has existed", code);
		});
	};

	self.getSettingsText = function () {
		return [
			"# File is generated ",
			"HiddenServiceDir " + conf.dir,
			"HiddenServicePort " + String(conf.virtualPort) + " 127.0.0.1:" + String(conf.localPort),
			"SOCKSPort " + String(conf.socksPort),
			" "
		].join("\n");
	};

	self.stop = function () {
		if (process) {
			process.kill();
			process = null;
		}
	};

	self.connect = function (host, port, f) {
		var socket = new ProxySocket(
			'127.0.0.1',
			conf.socksPort
		);

		//socket.on('socksdata', function (buffer) {
		//	console.log("[SOCKS]", buffer.toString('hex'));
		//});

		socket.connect(host, port, f);
		return socket;
	};

	self.createAgent = function () {
		var agent = new http.Agent({
		//	keepAlive: true
		});

		agent.createConnection = function (options, f) {
			return self.connect(
				options.host,
				options.port,
				f
			);
		};

		return agent;
	};

	self.agent = self.createAgent();

	return self;
}

util.inherits(Tor, EventEmitter);

module.exports = Tor;
