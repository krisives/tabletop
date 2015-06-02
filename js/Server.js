
var http = require('http');

function Server(port) {
	var self = this;
	var httpServer;
	var incoming = [];
	var outgoing = [];

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
		response.writeHead(200, {
			"Content-Type": "application/json"
		});

		response.end(JSON.stringify({
			test: "Testing"
		}));
	}

	return self;
}

module.exports = Server;
