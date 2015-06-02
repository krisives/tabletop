
function peerid(app, args) {
	if (!app.peerid) {
		app.log.print("Tor doesn't appear to be connected yet");
		return;
	}

	app.log.print("Your peer ID is " + app.peerid);
}

peerid.summary = "Print your globally unique ID for joining games";
peerid.usage = "/peerid";
peerid.help =
	"Behind the scenes Tabletop uses Tor to make it easy " +
	"for users to connect without giving away their IP or " +
	"forwarding ports."

module.exports = peerid;
