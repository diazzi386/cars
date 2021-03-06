var transmission = {
	automatic: true,
	gear: 0,
	direction: "0",
	kickdown: false,
	limiter: true,
	launch: false,
	busy: false,
	promise: null,
	tables: {
		start: function () {
			var diesel = (info.engine.fuel() == 'Diesel');
			if (!transmission.launch)
				return 0;
			else {
				if (diesel)
					return 2500;
				else {
					if (engine.max > 8500)
						return 6000;
					else if (engine.max > 7000)
						return 5000;
					else
						return 4000;
				}
			}
		}, up: function () {
			var diesel = (info.engine.fuel() == 'Diesel');
			if (diesel && engine.max > 5200)
				table = [3000, 3000, 4000, 5200];
			else if (diesel)
				table = [3000, 3000, 4000, 4800];
			else if (engine.max > 7000)
				table = [4000, 5000, 6000, engine.max - 300];
			else
				table = [3000, 4000, 5000, engine.max - 300];

			var index = 0;

			if (pedals.target.throttle == 1)
				index = 3;
			else if (pedals.target.throttle >= 0.8)
				index = 2;
			else if (pedals.target.throttle >= 0.5)
				index = 1;
			else
				index = 0;

			return table[index];
		}, kickdown: function () {
			var diesel = (info.engine.fuel() == 'Diesel');
			if (pedals.throttle == 1) {
				if (diesel)
					return 2000;
				else if (engine.max > 7000)
					return 4000;
				else
					return 3000;
			} else
				return 0;
			// if (transmission.gear == 1 && !pedals.brake && pedals.input.throttle && transmission.direction.includes("+S"))
			//	return 0;
		}, down: function () {
			var diesel = (info.engine.fuel() == 'Diesel');
			if (diesel)
				table = [1500, 1500, 2000, 2500];
			else if (engine.max > 7000)
				table = [2000, 2500, 3000, 3500];
			else
				table = [2500, 3000, 3500, 4000];

			if (pedals.brake == 1)
				index = 3;
			else if (pedals.brake >= 0.8)
				index = 2;
			else if (pedals.brake >= 0.5)
				index = 1;
			else
				index = 0;

			return table[index];
		}
	}, name: function (g) {
		g = g || transmission.gear;
		// if (g == 0 && transmission.park) return 'P'; else
		if (g == 0) return 'N';
		else if (g == -1) return 'R';
		else return g;
	}, tau: function (g) {
		g = g || transmission.gear;
		if (g == '+' && transmission.gear > 0)
			return car.transmission.gears[transmission.gear] / car.transmission.gears[transmission.gear - 1];
		else if (g == '-' && transmission.gear > 1)
			return car.transmission.gears[transmission.gear - 2] / car.transmission.gears[transmission.gear - 1];
		else if (g >= -1 && g <= car.transmission.gears.length) {
			if (g == 0) return 1;
			else if (g == -1) return car.transmission.reverse;
			else return car.transmission.gears[g - 1];
		}
	}, shift: function (g) {
		console.log(g);
		if (g == '+') {
			// if (transmission.gear == 0 && transmission.park)
			//	return transmission.park = 0;
			if (transmission.gear == 0 && !pedals.target.throttle)
				return;
			else
				transmission.shift(transmission.gear + 1);
		} else if (g == '-' && transmission.gear > 0)
			return transmission.shift(transmission.gear - 1);
		else if (g == '-' && transmission.gear == 0)
			return transmission.shift(-1);
		else if (g == -1 && transmission.gear == 0 && vehicle.speed == 0) {
			transmission.direction = "R-S";
			clutch.release();
			transmission.gear = -1;
		} else if (g == 0) {
			transmission.direction = Math.abs(g) + (transmission.gear < g ? "+" : "-") + (transmission.gear == 0 ? "S" : "");
			clearTimeout(transmission.promise);
			clutch.press();
			transmission.gear = 0;
		} else if (g == 1 && transmission.gear == 0) {
			transmission.direction = "1+S";
			clutch.release();
			transmission.gear = 1;
		} else if (g >= 1 && g <= car.transmission.gears.length) {
			transmission.busy = true;
			var t = car.transmission.gears.length >= 8 ? 100 : 100;
			var T = transmission.time();
			transmission.direction = Math.abs(g) + (transmission.gear < g ? "+" : "-") + (transmission.gear == 0 ? "S" : "");
			
			pedals.wait.throttle = true;
			setTimeout(function () {
				clutch.press();
			}, t);
			setTimeout(function (g) {
				transmission.gear = g;
			}, t, g);
			transmission.promise = setTimeout(clutch.release, T - t);
			setTimeout(function () {
				pedals.wait.throttle = false;
				transmission.busy = false;
			}, T);
		}
	}, upshift: function () {
		if (transmission.automatic)
			if (engine.rpm * transmission.tau('+') < transmission.regime('-'))
				return;
		transmission.kickdown = false;
		return transmission.shift('+');
	}, downshift: function () {
		if (transmission.automatic && transmission.gear > 1)
			if (engine.rpm * transmission.tau('-') >= transmission.regime('+'))
				return;
		if (transmission.gear > 1 && engine.rpm * transmission.tau('-') > transmission.regime('max'))
			return;
		if (pedals.throttle == 1) {
			if (transmission.kickdown && transmission.automatic)
				return;
			else
				transmission.kickdown = true;
		}
		return transmission.shift('-');
	}, logic: function () {
		if (!transmission.automatic || engine.startup || transmission.busy)
			return;
		if (transmission.gear == 0) {
			if (engine.rpm >= transmission.regime('+') && !pedals.target.brake && pedals.target.throttle)
				return transmission.upshift();
		} else if (!clutch.engaged) {
			if (Math.abs(vehicle.speed) < 15/3.6 && (!pedals.target.throttle || pedals.target.brake))
				return transmission.shift(0);
		} else if (transmission.gear > 0) {
			if (engine.rpm < transmission.regime('-'))
				return transmission.downshift();
			if (engine.rpm >= transmission.regime('+') && transmission.gear < car.transmission.gears.length)
				return transmission.upshift();
		}
	}, regime: function (m) {
		var diesel = (info.engine.fuel() == 'Diesel');
		var zero = car.engine.rpm[0];

		if (m == 'max')
			return engine.max;
		else if (m == 'min')
			return zero;
		else if (m == '+') {
			if (transmission.gear == 0)
				return transmission.tables.start();			
			else
				return transmission.tables.up();
		} else if (m == '-') {
			if (transmission.gear == 0)
				return 0;
			else if (pedals.target.throttle && transmission.gear == 1)
				return 0;
			else if (pedals.target.throttle && transmission.gear > 2)
				return transmission.tables.kickdown();
			else if (!pedals.target.throttle)
				return transmission.tables.down();	
			else if (pedals.target.brake)
				return transmission.tables.down();	
			else
				return 0;
		}
	}, time: function () {
		// t = 0.50; // 0.8, 1.2, 1.5
		if (car.transmission.gears.length >= 8 || car.transmission.desc == "D")
			t = 0.25;
		else
			t = 0.50;

		t = t + (new Date().getFullYear() - car.general.year)/10*0.1;
		if (car.transmission.desc == "S")
			t = t + 0.1;
		return t * 1000;
	}, toggle: function () {
		transmission.automatic = !transmission.automatic;
		localStorage.setItem("diazzi-cars-transmission", transmission.automatic);
	}, init: function () {
		car.transmission = {
			traction: (car.TRANSMISSION.split(" "))[0],
			desc: (car.TRANSMISSION.split(" "))[1],
			final: parseFloat((car.TRANSMISSION.split(" "))[2]),
			gears: []
		};

		l = (car.TRANSMISSION.split(" ")).length;

		var ratio = 0;

		for (var i = 3; i < l; i++) {
			ratio = parseFloat((car.TRANSMISSION.split(" "))[i]);
			if (ratio > 0) {
				if (ratio < 20)
					car.transmission.gears[i - 3] = parseFloat((car.TRANSMISSION.split(" "))[i]);
				else if (!car.transmission.limit)
					car.transmission.limit = ratio;
				else
					car.transmission.speed = ratio;
			} else {
				car.transmission.reverse = ratio;
			}
		}
		
		car.transmission.limit = car.transmission.limit || 250;
		car.transmission.speed = car.transmission.speed || 220;
		car.transmission.speed = Math.max(car.transmission.speed, car.transmission.limit);

		if (car.transmission.traction == "FWD")
			vehicle.geometry.center = 0.60;
		else
			vehicle.geometry.center = 0.50;

		if (localStorage.getItem("diazzi-cars-transmission")) {
			if (localStorage.getItem("diazzi-cars-transmission") == "true")
				transmission.automatic = true;
			else
				transmission.automatic = false;
		}
	}
};