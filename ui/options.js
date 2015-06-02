
$(function () {
	var oldSettings = createCopy();

	$('#options-reset').click(function () {
		app.settings = JSON.parse(oldSettings);
		update();
	});

	$('#options-accept').click(function (e) {
		app.settings.bg = $('#options-bg').val();
		app.settings.name = $('#options-name').val();
		
		app.saveSettings();
		oldSettings = createCopy();
	});

	function createCopy() {
		return JSON.stringify(app.settings);
	}

	function update() {
		var settings = app.settings;

		$('#options-name').val(settings.name);
		$('#options-bg').val(settings.bg);
	}

	update();
});
