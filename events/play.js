	handlers.play = function (e) {
		var player = self.getPlayer(e.player);

		if (!player) {
			throw "What is this madness?";
		}

		var thingID = player.createThingID();
		var thing = new Thing(thingID, e.data);

		self.addThing(thing);
	};