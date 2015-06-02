
var gui = require('nw.gui');
var win = gui.Window.get();

// Keep shift clicking and other things from opening a new window
win.on('new-win-policy', function (frame, url, policy) {
	policy.forceCurrent();
});
