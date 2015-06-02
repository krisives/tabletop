
function roll(app, args) {
	var x = 1 + (~~Math.round(Math.random() * 5));
	app.log.print("Rolled a " + x);
}

roll.help = "Roll a die";

module.exports = roll;
