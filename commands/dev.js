
function dev(app, args) {
	app.win.showDevTools();
}

dev.summary = "Show the developer tools window";
dev.usage = "/dev";
dev.help = "Brings up the developer tools for debugging";

module.exports = dev;
