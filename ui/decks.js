
$(function () {
	var dropdown = $('#decks-dropdown');
	var list = $('#decks-list-cards');

	refresh();

	dropdown.change(function (e) {
		var id = dropdown.val();
		var deck = app.decks.getDeck(id);

		if (!deck) {
			return;
		}

		app.changeDeck(deck);
	});

	$('#decks-new').click(function (e) {
		app.changeDeck(app.decks.createDeck());
		app.saveDecks();
	});

	$('#decks-name').keypress(function (e) {
		if (e.keyCode !== 13) {
			return;
		}

		app.currentDeck.name = $('#decks-name').val();
		refresh();
	});

	$('#decks-search-target').change(function (e) {
		search();
	});

	$('#decks-search').keypress(function (e) {
		if (e.keyCode !== 13) {
			return;
		}

		e.preventDefault();
		search();
	});

	function search() {
		var keyword = $('#decks-search').val().trim();
		var mode = $('#decks-search-target').val();

		switch (mode) {
		case 'results':
			searchResults(keyword);
			break;
		case 'deck':
			searchDeck(keyword);
			break;
		default:
			searchDatabase(keyword);
			break;
		}
	}

	function searchDatabase(keyword) {
		$('#decks-results').empty();

		if (keyword.length <= 0) {
			return;
		}

		app.db.search(keyword, addResult);
	}

	function searchDeck(keyword) {
		var filter = new RegExp(keyword, 'i');
		$('#decks-results').empty();

		Object.keys(app.currentDeck.cards).forEach(function (id) {
			var card = app.db.getCard(id);

			if (!card) {
				return;
			}

			if (filter.test(card.name)) {
				addResult(card);
			}
		});
	}

	function searchResults(keyword) {
		if (keyword.length <= 0) {
			return;
		}

		var filter = new RegExp(keyword, 'i');

		$('#decks-results .decks-result').each(function (i, elem) {
			var node = $(elem);
			var id = node.data('cardid');
			var card = app.db.getCard(id);

			if (!card) {
				return;
			}

			if (!filter.test(card.name)) {
				node.detach();
			}
		});
	}

	$('#decks-results').mousedown(function (e) {
		e.preventDefault();

		var node = $(e.target).parents('.decks-result');

		if (node.length <= 0) {
			return;
		}

		var card = app.db.getCard(node.data('cardid'));

		if (!card) {
			return;
		}

		if (e.button === 0) {
			app.modifyDeckCard(card, 1);
		} else {
			app.modifyDeckCard(card, -1);
		}

		var count = app.currentDeck.cards[card.multiverseid];
		var quantityNode = node.find('.decks-result-quantity');

		if (count > 0) {
			if (quantityNode.length <= 0) {
				quantityNode = $('<div class="decks-result-quantity"></div>');
				node.append(quantityNode);
			}

			quantityNode.text(count);
		} else {
			node.find('.decks-result-quantity').detach();
		}
	});

	$('#decks-list-cards').mousedown(function (e) {
		e.preventDefault();

		var node = $(e.target).parents('.decks-list-card');

		if (node.length <= 0) {
			return;
		}

		var card = app.db.getCard(node.data('cardid'));

		if (!card) {
			return;
		}

		if (e.button === 0) {
			app.modifyDeckCard(card, 1);
		} else {
			app.modifyDeckCard(card, -1);
		}
	});

	app.on('deck-change', function () {
		refresh();
	});

	function refresh() {
		$('#decks-name').val(app.currentDeck.name);

		dropdown.empty();

		app.decks.eachDeck(function (deck) {
			dropdown.append(
				$('<option></option>')
					.val(deck.id)
					.text(deck.name)
					.prop('selected', deck == app.currentDeck)
			);
		});

		list.empty();

		Object.keys(app.currentDeck.cards).forEach(function (id) {
			var card = app.db.getCard(id);
			var quantity = app.currentDeck.cards[id];

			if (!card) {
				return;
			}

			if (quantity <= 0) {
				return;
			}

			list.append($('<div class="decks-list-card"></div>')
				.data('cardid', card.multiverseid)
				.append(
					$('<div class="decks-list-item-image"></div>').append(
						$('<img>').attr('src', cardURL(card.multiverseid))
					),
					$('<span class="decks-list-item-quantity"></span>').text(quantity),
					$('<span> &times; </span>'),
					$('<span></span>').text(card.name)
			));
		});
	}

	function addResult(card) {
		var node = $('<div class="decks-result"></div>');
		var img = $('<img>');
		var count = app.currentDeck.cards[card.multiverseid];

		img.attr('src', cardURL(card.multiverseid));
		node.data('cardid', card.multiverseid);
		node.append(img);

		if (count > 0) {
			node.append($('<div class="decks-result-quantity"></div>')
				.text(count)
			);
		}

		$('#decks-results').append(node);
	}
});

function cardURL(id) {
	return "http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=" + String(id) +"&type=card";
}
