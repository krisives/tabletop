
function Player(id, data) {
	var self = this;
	var nextThingID;

	id = ~~id;

	if (id <= 0) {
		throw "Player ID must be positive";
	}

	data = data || {};
	nextThingID = data.nextThingID || 0;

	self.createThingID = function () {
		nextThingID++;
		return id | (nextThingID << 8);
	};

	return self;
}

module.exports = Player;
