
function DeckBuilder() {
	var self = this;
	var decks = {};

	self.load = function (data) {
		var count = 0;

		data = data || {};
		decks = data;

		Object.keys(decks).forEach(function (originalID) {
			var deck;

			id = (~~originalID);

			if (id <= 0) {
				delete decks[originalID];
				return;
			}

			deck = decks[id];
			deck.id = id;
			deck.name = deck.name || defaultName(id);
			deck.cards = deck.cards || {};
			deck.lastUsed = deck.lastUsed || Date.now();
			count++;
		});

		return count;
	};

	self.save = function () {
		return JSON.stringify(decks);
	};

	function nextID() {
		var id = 1;

		self.eachDeck(function (deck) {
			id = Math.max(id, deck.id + 1);
		});

		return id;
	}

	function defaultName(id) {
		return "Untitled Deck " + String(id);
	}

	self.createDeck = function (name, cards) {
		var id = nextID();

		name = name || defaultName(id);
		cards = cards || {};

		decks[id] = {
			id: id,
			name: name,
			cards: cards,
			lastUsed: Date.now()
		};

		return decks[id];
	};

	self.eachDeck = function (f) {
		Object.keys(decks).forEach(function (deckID) {
			f(decks[deckID]);
		});
	};

	self.getDeck = function (id) {
		return decks[id];
	};

	self.getMostRecent = function () {
		var when = 0;
		var mostRecent;

		self.eachDeck(function (deck) {
			if (deck.lastUsed >= when) {
				mostRecent = deck;
				when = deck.lastUsed;
			}
		});

		return mostRecent;
	};

	return self;
}

module.exports = DeckBuilder;
