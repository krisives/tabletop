
$(function () {
	$(window).keyup(function (e) {
		if (e.keyCode !== 27) {
			return;
		}

		$('#game').toggleClass('game-show-menu');
	});

	app.game.on('play', function (event) {

	});

	app.game.on('tap', function (event) {

	});

	app.game.on('move', function (event) {

	});
});
