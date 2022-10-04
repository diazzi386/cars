var vehicle = {
	distance: 0,
	speed: 0,
	acceleration: 0,
	geometry: {
		wheelbase: 0,
		center: 0,
		height: 0,
		area: 0,
		cd: 0,
		cl: 0
	}
};

var pedals = {
  clutch: 0,
	brake: 0,
	throttle: 0,
	sport: false,
	electronics: true
};

var engine = {
	power: {},
	torque: {},
	rpm: {},
	mu: 1,
	inertia: 0,
	throttle: function () {
		var t = pedals.throttle;
		t = engine.rpm.now >= engine.rpm.max ? 0 : t;
		t = Math.sqrt(t);

		if (transmission.gear == 0 || pedals.clutch || !transmission.coupled) {
			if (transmission.gear != 0 && !pedals.clutch && transmission.before != 0) {
				if (transmission.gear > 1 && transmission.before > 0) {
					t *= {
						"M": 0,
						"A": (transmission.gears.length > 6 ? 0.25 : 0.5),
						"S": 0,
						"D": 0
					}[transmission.type];
				} else if (transmission.gear > 1 && transmission.before > transmission.gear) {
					t = 0;
				}
			}
		}

		return t;
	}, lookup: function (x = engine.rpm.now, t = engine.throttle()) {
		var torque = Math.min(
			7025*engine.power.max/engine.power.rpm*(2-x/engine.power.rpm),
			engine.torque.max,
			engine.torque.max*(0.5 + 0.5*x/engine.torque.rpm)
		);
		var losses = -0.35 * engine.torque.max * (engine.rpm.now - engine.rpm.min) / (engine.rpm.max - engine.rpm.min);
		engine.torque.now = torque * t + (1 - t) * losses;
		engine.power.now = engine.torque.now * engine.rpm.now / 7025;
		return engine.torque.now;
	}, losses: function () {		
		return -0.35 * engine.torque.max * (engine.rpm.now - engine.rpm.min) / (engine.rpm.max - engine.rpm.min);
	}
};

var transmission = {
	gear: 0,
	before: 0,
  coupled: true,
  tau: 0,
	slip: 0,
	mu: 0,
	automatic: true,
  launch: false,
  shift: function (direction) {
		if (transmission.gear > 1 && vehicle.speed / tires.radius * 60 / (2 * Math.PI) * transmission.final * transmission.gears[transmission.gear - 1 + Math.sign(direction)] > engine.rpm.max + 500)
			return console.warn("transmission.shift: shifting: engine RPM too high");
    else if (direction > 0) {
			if (transmission.gear >= transmission.gears.length)
				return console.warn("transmission.shift: already in highest gear");
			transmission.before = transmission.coupled ? transmission.gear : transmission.before;
      transmission.gear = Math.min(transmission.gear + 1, transmission.gears.length);
		} else if (direction < 0) {
			if (transmission.gear <= -1)
				return console.warn("transmission.shift: already in reverse");
			transmission.before = transmission.coupled ? transmission.gear : transmission.before;
      transmission.gear = Math.max(transmission.gear - 1, -1);
		} else
      transmission.gear = transmission.before = 0;

		if (transmission.gear == 0) {
				transmission.tau = 0;
				transmission.coupled = true;
		} else {
        transmission.coupled = false;
				if (transmission.gear == -1)
      		transmission.tau = transmission.reverse * transmission.final;
				else
        	transmission.tau = transmission.gears[transmission.gear - 1] * transmission.final;
		}

		return transmission.gear;
	}, name: function () {
		if (transmission.gear == 0)
			return "N";
		else if (transmission.gear == -1)
			return "R";
		else
			return transmission.gear;
	}, tables: {
		up: function () {
			if (pedals.sport) {
				if (pedals.throttle < 1)
					return Math.ceil(engine.rpm.max * 0.8 / 500)*500;
				for (var i = engine.power.rpm; i < engine.rpm.max; i += 100) {
					if (engine.lookup(i) * transmission.gears[transmission.gear - 1]
						< engine.lookup(i * transmission.gears[transmission.gear] / transmission.gears[transmission.gear - 1]) * transmission.gears[transmission.gear])
						return i;
				}
				return engine.rpm.max - 100;
			} else
				return 2000 + (pedals.throttle > 0.5 ? (pedals.throttle - 0.5)/0.5 * 1000 : 0);
		}, down: function () {
			if (transmission.gear == 1 && !pedals.throttle)
				return engine.rpm.min;
			if (pedals.sport)
				return Math.floor(engine.rpm.max * 0.5 / 500)*500;
			else
				return (pedals.throttle > 0.9 ? 1500 : 1000) + (pedals.brake * 500);
		}
	}, check: function () {
		if (!transmission.automatic)
			return;
		if (transmission.gear == 0 && engine.rpm.now >= engine.rpm.min && !pedals.brake && pedals.throttle && !pedals.clutch && vehicle.speed >= 0) {
			return transmission.shift(1);
		} else if (transmission.gear != 0 && !pedals.throttle && vehicle.speed / tires.radius * 60 / (2 * Math.PI) * transmission.final * transmission.gears[transmission.gear - 1] <= engine.rpm.min) {
			return transmission.shift(-1 * Math.sign(transmission.gear));
		} else if (transmission.gear > 0 && transmission.coupled && !pedals.clutch) { // D2 and brake and throttle, not coupled -> ?
			if (engine.rpm.now >= transmission.tables.up() && transmission.gear < transmission.gears.length) {
				return transmission.shift(1);
			} else if (engine.rpm.now <= transmission.tables.down()) { // Correggere perchè scala senza essere necessario a volte
				if (transmission.gear <= 2 && pedals.throttle && !pedals.brake)
					return;
				return transmission.shift(-1);
			}
		}
	}, torque: function () {
		tc = engine.lookup(engine.rpm.now, 1);
		if (transmission.before == 0) {
			tc *= Math.min((Math.max(engine.rpm.now, engine.rpm.min) - engine.rpm.min) / ((engine.fuel == 'D' ? 2000 : 3000) - engine.rpm.min), 1);
		} else if (transmission.gear > transmission.before) {
			tc *= {
				"M": 0.25,
				"A": 1,
				"S": 0.35,
				"D": 1
			}[transmission.type] * Math.min(engine.rpm.now / engine.rpm.max, 1);
		} else {
			tc *= Math.min(engine.rpm.now / engine.rpm.max, 1);
		}
		return tc;
	}
};

var tires = {
  rpm: 0,
  speed: 0,
	slip: 0,
  mu: 0,
  radius: 0,
  f: 0.015,
};