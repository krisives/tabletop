
function roll(app, args) {
	// TODO this needs to use a synchronized random
	var x = 1 + (~~Math.round(Math.random() * 5));
	app.log.print("Rolled a " + x);
}

roll.summary = "Roll a die";
roll.usage = "/roll";
roll.help = "Roll a die randomly. This is a six sided die";


module.exports = roll;
