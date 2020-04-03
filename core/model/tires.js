var tires = {
	RPM: 0,
	speed: 0,
	mu: 0.9,
	radius: 0,
	f: function (v) {
		return 0.010 * (1 + v / 50);
	}, init: function () {
		var TIRES = {
			front: car.TIRES.includes(" ") ? car.TIRES.split(" ")[0] : car.TIRES,
			rear: car.TIRES.includes(" ") ? car.TIRES.split(" ")[1] : car.TIRES
		};

		car.tires = TIRES;

		if (car.TIRES.includes("Z"))
			tires.mu = 1.1;
		else
			tires.mu = 0.9;

		tires.mu /= 1 + (new Date().getFullYear() - car.general.year)/10*0.05;

		tires.radius = 0.5 * info.tires.calc().D / 1000;
	}
};