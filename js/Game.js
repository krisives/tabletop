
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Thing = require('./Thing.js');
var Player = require('./Player.js');

function Game(id, history) {
	var self = this;
	var handlers = {};
	var things = {};
	var players = {};

	EventEmitter.call(self);

	function construct() {
		// Start with history passed to constructor
		self.history = history = (history || []);
	}

	function createThingHandler(f) {
		return function (event) {
			var thing = self.getThing(event.thing);

			if (!thing) {
				throw "Missing target thing for event";
			}

			f(thing, event);
		};
	}

	self.load = function () {
		history.forEach(function (e) {
			self.perform(e);
		});
	};

	self.addEventHandler = function (name, f) {
		handlers[name] = f;
	};

	self.save = function () {
		return JSON.stringify(history);
	};

	self.addPlayer = function (player) {
		players[player.id] = player;
	};

	self.addThing = function (thing) {
		things[thing.id] = thing;
	};

	self.removeThing = function (thing) {
		if (thing.id in things) {
			delete things[thing.id];
			self.emit('remove', thing);
		}
	};

	self.getThing = function (id) {
		return things[id];
	};

	self.perform = function (event) {
		if (!event) {
			return;
		}

		var f = handlers[event.type];

		if (!f) {
			throw "Unknown event type " + event.type;
		}

		try {
			f(event);
		} catch (error) {
			console.log(error);
		}

		self.emit('event', event);
		self.emit(event.type, event);
	};

	self.random = function (min, max) {
		
	};

	construct();

	return self;
}

util.inherits(Game, EventEmitter);

module.exports = Game;
