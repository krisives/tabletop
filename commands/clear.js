
function clear(app, args) {
	app.log.clear();
}

clear.summary = "Clears the console";
clear.usage = "/clear";
clear.help = "Nothing special, just clears the console.";

module.exports = clear;
