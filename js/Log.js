
function Log(app) {
	var self = this;
	var $ = app.dom;
	var root = $('#console');
	var items = $('#console-log');

	self.start = function () {

	};

	self.stop = function () {

	};

	self.clear = function () {
		items.empty();
	};

	self.print = function (text) {
		items.append(
			$('<div></div>').text(text)
		);

		$('#console-log-box').scrollTop($('#console-log').height());
	};

	self.command = function (text) {
		app.command(text);
	};

	return self;
}

module.exports = Log;
