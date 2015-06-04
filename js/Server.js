
var http = require('http');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var NodeRSA = require('node-rsa');

function Server(port) {
	var self = this;
	var httpServer;

	EventEmitter.call(self);

	self.port = port = (~~port);

	if (port <= 0) {
		throw "Must specify a local port for the HTTP server";
	}

	self.start = function () {
		if (httpServer) {
			return;
		}

		httpServer = http.createServer(acceptRequest);
		httpServer.listen(port);
	};

	self.stop = function () {
		if (httpServer) {
			httpServer.close();
			httpServer = null;
		}
	};

	function acceptRequest(request, response) {
		var posted = [];

		if (!httpServer) {
			return;
		}

		if (request.method === 'POST') {
			request.on('data', function (data) {
				posted.push(data);
			});

			request.on('end', function () {
				var buffer = Buffer.concat(posted);

				handleIncoming(request, response, posted);
				finishRequest(request, response);
			});
		} else {
			finishRequest(request, response);
		}
	}

	function handleIncoming(request, response, text) {
		var msg;

		try {
			msg = JSON.parse(text);
		} catch (e) {
			console.log(e);
			return;
		}

		if (!msg) {
			return;
		}

		if (!msg.from) {
			return;
		}

		self.emit('message', msg);
	}

	function finishRequest(request, response) {
		response.writeHead(200, {
			"Content-Type": "application/json"
		});

		console.log("request", request.socket.remoteAddress);
		console.log("headers", request.headers);

		var msg = {
			test: "Testing"
		};

		response.end(JSON.stringify(msg));
	}

	return self;
}

util.inherits(Server, EventEmitter);

module.exports = Server;
