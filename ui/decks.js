
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

	$('#decks-search').keypress(function (e) {
		if (e.keyCode !== 13) {
			return;
		}

		e.preventDefault();

		var keyword = $('#decks-search').val().trim();

		if (keyword.length <= 0) {
			return;
		}

		$('#decks-cards').empty();
		app.db.search(keyword, addResult);
	});

	$('#decks-cards').mousedown(function (e) {
		e.preventDefault();

		var node = $(e.target).parents('.decks-card');

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
		var node = $('<div class="decks-card"></div>');
		var img = $('<img>');

		img.attr('src', cardURL(card.multiverseid));
		node.data('cardid', card.multiverseid);
		node.append(img);

		$('#decks-cards').append(node);
	}
});

function cardURL(id) {
	return "http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=" + String(id) +"&type=card";
}
