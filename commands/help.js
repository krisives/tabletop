
function help(app, args) {
	var name = args[1] || '';

	if (name) {
		showUsage(app, name);
		return;
	}

	listCommands(app);
}

function listCommands(app) {
	app.log.print("Command listing");

	app.log.print("------");
	app.eachCommand(function (command) {
		app.log.print(command.name + ": " + command.summary);
	});

	app.log.print("------");
	app.log.print("Pass a command name to get more info");
}

function showUsage(app, name) {
	var command = app.findCommand(name);

	if (!command) {
		app.log.print("No such command '" + name + "'");
		return;
	}

	app.log.print("USAGE: " + command.usage);
	app.log.print(command.help);
}

help.summary = "The help text you are currently reading";
help.usage = "/help <command>";
help.help = "Did you mean recursion?";

module.exports = help;
