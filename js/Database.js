
var fs = require('fs');

function Database() {
	var self = this;
	var data;
	var cardsByID = {};

	self.load = function (jsonData) {
		data = jsonData;

		self.eachSet(function (set) {
			set.cards.forEach(function (card) {
				if (card.multiverseid <= 0) {
					return;
				}

				cardsByID[card.multiverseid] = card;
			});
		});
	};

	self.eachSet = function (f) {
		Object.keys(data).forEach(function (id) {
			var set = data[id];

			f(set);
		});
	};

	self.eachCard = function (f) {
		Object.keys(cardsByID).forEach(function (id) {
			var card = cardsByID[id];

			if (card.multiverseid <= 0) {
				return;
			}

			f(card);
		});
	};

	self.getCard = function (id) {
		if (id <= 0) {
			return;
		}
		
		return cardsByID[id];
	};

	self.search = function (text, f) {
		var filter = new RegExp(text, 'i');

		self.eachCard(function (card) {
			if (filter.test(card.name)) {
				f(card);
			}
		});
	};

	return self;
}

module.exports = Database;
