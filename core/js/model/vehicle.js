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

var engine = {
	power: {},
	torque: {},
	mu: 1,
	min: 0,
	max: 0,
	rpm: 0,
	inertia: 1,
	injection: 1,
	lookup: function (x = engine.rpm) {		
		return Math.min(
			7025*engine.power.max/engine.power.rpm*(2-x/engine.power.rpm),
			engine.torque.max,
			engine.torque.max*(0.5 + 0.5*x/engine.torque.rpm)
		);
	}, losses: function (x = engine.rpm) {		
		return -0.5 * engine.torque.max * (engine.rpm - engine.min) / (engine.max - engine.min);
	}, torque: function () {
		var m = engine.min / engine.max;
		var x = engine.rpm / engine.max;
		var t = pedals.throttle;

		if (engine.rpm >= (transmission.launch ? Math.max(transmission.tables.start(), engine.torque.rpm) : engine.max))
			t = 0;
			
		return t * engine.lookup() + (1 - t) * engine.losses(); // * (0.9 + 0.2 * Math.random());
	}
};

var transmission = {
	gear: 0,
	direction: 0,
    name: "N",
    tau: 0,
	mu: 0,
    final: 0,
	automatic: true,
	logic: 2,
    coupled: true,
    launch: false,
    up: function () {
        transmission.shift(1);
        return transmission.gear;
	}, down: function () {
        transmission.shift(-1);
        return transmission.gear;
	}, shift: function (direction) {
        if (direction == 1) {
			if (transmission.gear == transmission.gears.length)
				return console.log("Already in highest gear (" + transmission.gear + ")");
            transmission.gear = transmission.gear + 1;
		} else if (direction == -1) {
			if (engine.rpm * transmission.gears[transmission.gear - 1] / transmission.gears[transmission.gear] > engine.max + 1000)
				return console.warn("Shifting down: engine RPM too high");
            transmission.gear = Math.max(transmission.gear - 1, -1);
		} else if (direction == 0)
            transmission.gear = 0;
		else
			return;
			
		transmission.direction = direction;

        switch (transmission.gear) {
            case 0:
                transmission.name = "N";
                transmission.tau = 0;
				transmission.coupled = true;
				break;
            case -1:
                transmission.name = "R";
                transmission.tau = 1 / transmission.reverse / transmission.final;
                transmission.coupled = false;
				break;
            default:
                transmission.name = transmission.gear;
                transmission.tau = 1 / transmission.gears[transmission.gear - 1] / transmission.final;
                transmission.coupled = false;
				break;
		}

		// console.log("Shifted into " + transmission.name + ".");
		return transmission.gear;
    }, turn: function () {
        transmission.automatic = !transmission.automatic;
        localStorage.setItem("cars/minimal transmission", transmission.automatic);
    }, tables: {
		start: function () {
			return [1000, 1500, engine.fuel == 'D' ? 2000 : 3000][transmission.logic];
		}, up: function () {
			var m = engine.max - 100;
			if (transmission.gear > 0 && transmission.gear < transmission.gears.length)
				if (engine.lookup() * transmission.gears[transmission.gear - 1]
					< engine.lookup(engine.rpm * transmission.gears[transmission.gear] / transmission.gears[transmission.gear - 1])
					* transmission.gears[transmission.gear])
					m = Math.min(engine.rpm, m);
			return [
				2000,
				3000,
				m
			][transmission.logic];
		}, down: function () {
			return [1000, 1500, engine.fuel == 'D' ? 2500 : 3000][transmission.logic];
		}
	}, check: function () {
		if (!transmission.automatic)
			return;
		if (transmission.gear == 0) {
			if (engine.rpm >= transmission.tables.start() && !pedals.brake && pedals.throttle && !pedals.clutch && vehicle.speed >= 0) {
				// console.log("Transmission: starting from a stop...");
				return transmission.up();
			}
		} else if (Math.abs(vehicle.speed) < 10/3.6 && pedals.brake) {
			// console.log("Transmission: coming to a stop...");
			return transmission.shift(0);
		} else if (transmission.gear > 0 && transmission.coupled) {
			if (engine.rpm >= transmission.tables.up() && transmission.gear < transmission.gears.length) {
				// console.log("Transmission: shifting up...");
				return transmission.up();
			} else if (engine.rpm <= transmission.tables.down() && transmission.gear > (pedals.throttle ? 2 : 1)) {
				// console.log("Transmission: shifting down...");
				return transmission.down();
			}
		}
	}
};

var tires = {
    rpm: 0,
    speed: 0,
    mu: 0,
    radius: 0,
    f: 0.015,
	speed: 0,
	slip: 0,
	grip: function () {
		return Math.min(tires.mu * tires.slip, 1);
	}
};