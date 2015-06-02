
$(function () {
	var grabbed = false;		// Set when being moved
	var resizing = false;		// Set when being resized
	var grabX, grabY;			// Position of grab or resize
	var root = $('#console');

	function drag(x, y) {
		root.css({
			left: x - grabX,
			top: y - grabY
		});
	}

	function resize(x, y) {
		var pos = root.offset();

		root.css({
			width: x - pos.left,
			height: y - pos.top
		});
	}

	root.mousedown( function (e) {
		if ($(e.target).is('#console-input,#console-log > div')) {
			return;
		}

		e.preventDefault();

		if ($(e.target).is('#console-resizer')) {
			resizing = true;
		} else {
			var pos = root.offset();
			grabX = e.clientX - pos.left;
			grabY = e.clientY - pos.top;

			grabbed = true;
		}
	});

	$(window).mousemove( function (e) {
		if (grabbed) {
			drag(e.clientX, e.clientY);
		}

		if (resizing) {
			resize(e.clientX, e.clientY);
		}
	});

	$(window).mouseup( function (e) {
		grabbed = false;
		resizing = false;
	});

	$(window).keypress(function (e) {
		if (String.fromCharCode(e.keyCode) === '`') {
			e.preventDefault();
			root.toggle();

			if (root.is(':visible')) {
				$('#console-input').focus();
			}
		}
	});

	$('#console-input').keypress(function (e) {
		if (e.keyCode !== 13) {
			return;
		}

		e.preventDefault();

		var text = $('#console-input').val().trim();
		$('#console-input').val('');

		app.command(text);
	});

	$("#console-close").click(function (e) {
		e.preventDefault();
		$('#console').hide();
	});

	setInterval(function () {
		var pos = root.offset();
		var changed = false;

		if (pos.left < -root.width() * 0.95) {
			pos.left = 0;
			changed = true;
		}

		if (pos.top < -root.height() * 0.95) {
			pos.top = 0;
			changed = true;
		}

		if (pos.left > $(window).width() * 0.95) {
			pos.left = $(window).width() - root.width() - 10;
			changed = true;
		}

		if (pos.top > $(window).height() * 0.95) {
			pos.top = $(window).height() - root.height() - 10;
			changed = true;
		}

		if (changed) {
			root.offset(pos);
		}
	}, 333);
});
