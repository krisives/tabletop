
var App = require('./js/App.js');

exports.loadApp = function ($, gui) {
	var app = new App($, gui);
	window.app = app;
	app.load();
};
