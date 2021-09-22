var transmission = {
	gear: 0,
	direction: 0,
    name: "N",
    tau: 0,
    final: 0,
	automatic: true,
	mode: 1,
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
			if (transmission.gear == transmission.data.gears.length)
				return log.print("Already in highest gear (" + transmission.gear + ")");
            transmission.gear = transmission.gear + 1;
		} else if (direction == -1) {
			if (engine.rpm * transmission.data.gears[transmission.gear - 1] / transmission.data.gears[transmission.gear] > engine.max + 1000)
				return log.print("Shifting down: engine RPM too high");
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
                transmission.tau = 1 / transmission.data.reverse / transmission.final;
                transmission.coupled = false;
				break;
            default:
                transmission.name = transmission.gear;
                transmission.tau = 1 / transmission.data.gears[transmission.gear - 1] / transmission.final;
                transmission.coupled = false;
				break;
		}

		log.print("Shifted into " + transmission.name + ".");
		return transmission.gear;
    }, turn: function () {
        transmission.automatic = !transmission.automatic;
        localStorage.setItem("cars/minimal transmission", transmission.automatic);
    }, set: function (number) {
		if (number > 0)
       		transmission.mode = Math.min(transmission.mode + 1, 1);
		else
			transmission.mode = Math.max(transmission.mode - 1, 0);
		log.print("Transmission set to: " + ["NORMAL", "SPORT"][transmission.mode]);
		return transmission.mode;
    }, tables: {
		start: function () {
			if (engine.data.fuel == 'D')
				return [1500, 2500][transmission.mode];
			else
				return [1500, 3000][transmission.mode];
		}, up: function () {
			return [engine.data.fuel == 'D' ? 2000 : 3000, engine.max - (pedals.throttle ? 500 : 1500)][transmission.mode];
		}, down: function () {
			if (engine.data.fuel == 'D')
            	return [1000, 2000][transmission.mode];
			else
				return [1500, 3000][transmission.mode];
		}
	}, check: function () {
		if (!transmission.automatic)
			return;
		if (transmission.gear == 0) {
			if (engine.rpm >= transmission.tables.start() && !pedals.brake && pedals.throttle && !pedals.clutch && vehicle.speed >= 0) {
				log.print("Transmission: starting from a stop...");
				return transmission.up();
			}
		} else if (Math.abs(vehicle.speed) < 10/3.6 && pedals.brake) {
			log.print("Transmission: coming to a stop...");
			return transmission.shift(0);
		} else if (transmission.gear > 0) {
			if (engine.rpm >= transmission.tables.up() && transmission.coupled && transmission.gear < transmission.data.gears.length) {
				log.print("Transmission: shifting up...");
				return transmission.up();
			} else if (engine.rpm <= transmission.tables.down() && transmission.gear > 1 && transmission.coupled && !pedals.throttle) {
				log.print("Transmission: shifting down...");
				return transmission.down();
			}
		}
	}
};