
	handlers.shuffle = createThingHandler(function (thing, e) {
		if (!thing.shuffle) {
			throw "Tried to shuffle something that doesn't shuffle";
		}

		thing.shuffle(e.seed);
	});