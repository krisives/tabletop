	handlers.tap = createThingHandler(function (thing, e) {
		thing.set('tap', e.tapped);
	});