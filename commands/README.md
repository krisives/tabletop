
This is where user runnable commands go. They are executed
by App.command() and follow a few simple rules:

First, you must export a function like most any nodejs module
would:

	function example(app, args) {
		// Do your thing
	}

	module.exports = example;

That alone will work mostly, but you should provide some extra
bits of information so the /help command can do it's job.

 * Provide a .summary for your function. This is a short text
   description used when displaying a command listing.

 * Provide a .usage which shows how the command can be used. If the
   command has no arguments like simply '/example' or more complex
   like '/example <name>'

 * Provide a .help which is a full length description of how to
   use the command and what it does. This is shown when the user
   runs '/help <command>'
