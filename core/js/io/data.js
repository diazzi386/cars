var data = {
	request: {
		file: null,
		car: null,
	}, history: {
		file: null,
		car: null,
	}, cars: [],
	load: function () {
		log.print("Loading...");
		var location = window.location.href;

		data.history.file = localStorage.getItem("cars/minimal/data/request/file") || "Diazzi";
		data.history.car = localStorage.getItem("cars/minimal/data/request/car/" + data.history.file);

		if (location.includes("?") && location.split('?')[1].split('/').length == 1) {
			data.request.file = location.split('?')[1].split('/')[0];
			data.request.car = data.history.car;
		} else if (location.includes("?") && location.split('?')[1].split('/').length == 4) {
			data.request.file = data.history.file;
			data.request.car = location.split('?')[1];
		} else if (location.includes("?") && location.split('?')[1].split('/').length == 5) {
			data.request.file = location.split('?')[1].split('/')[0];
			data.request.car = location.split('?')[1].split('/').slice(1).join("/");
		} else {
			data.request.file = data.history.file;
			data.request.car = data.history.car;
		}

		var script = document.createElement('script');
		script.src = "./cars/" + data.request.file + ".js";
		script.onload = data.success;
		script.onerror = data.almost;
		document.head.appendChild(script);
		log.print("File requested: '/cars/" + data.request.file + ".js'...");
	}, success: function () {
		localStorage.setItem("cars/minimal/data/request/file", data.request.file);
		log.print("File successfully loaded.");

		if (!cars)
			return log.print("0 cars found.");

		var link;
		for (var i in cars) {
			for (var j in cars[i]) {
				if (j == "country")
					continue;
				for (var l in cars[i][j]) {
					link = i + "/" + j + "/" + l.substr(0, 4) + "/" + l.substr(5);
					link = link.replace(/ /g, "_");
					data.cars.push(link);
				}
			}
		}

		log.print(data.cars.length + " cars found.");
		log.print("Searching for car: '" + data.request.car + "'...");

		for (var i in data.cars) {
			if (data.request.car == data.cars[i]) {
				log.print("Found!");
				localStorage.setItem("cars/minimal/data/request/car/" + data.request.file, data.request.car);
				return io.init();
			}		
		}

		data.redirect();
	}, almost: function () {
		log.print("File not found.");
		data.request.file = data.history.file;
		var script = document.createElement('script');
		script.src = "./cars/" + data.request.file + ".js";
		script.onload = data.success;
		script.onerror = data.fail;
		document.head.appendChild(script);
		log.print("File requested: '/cars/" + data.request.file + ".js'...");
	}, fail: function () {
		return window.location = "?Diazzi";
	}, redirect: function (random = false) {
		if (random || !localStorage.getItem("cars/minimal/data/request/car/" + data.request.file))
			return window.location = "?" + data.cars[Math.floor(Math.random()*data.cars.length)];
		else
			return window.location = "?" + localStorage.getItem("cars/minimal/data/request/car/" + data.request.file);
	}, parse: function () {
        log.print("Parsing car data...");
		brand = data.request.car.split('/')[0].replace(/_/g, " ");
		serie = data.request.car.split('/')[1].replace(/_/g, " ");
		year = data.request.car.split('/')[2];
		model = year + " " + data.request.car.split('/')[3].replace(/_/g, " ");
		var car = cars[brand][serie][model];

		document.title = brand + " " + model.substr(5) + " '" + model.substr(2, 2);
		country = cars[brand].country;

		var ENGINE = car.split("; ")[0];
		var TRANSMISSION = car.split("; ")[1];
		var TIRES = car.split("; ")[2];
		var MASSES = car.split("; ")[3];
		var AERO = car.split("; ")[4];

		// CAR

		vehicle.data = {
			brand: brand,
			model: model.substr(5),
			year: year,
			country: country
		};

		// GEOMETRY
		vehicle.geometry.mass = parseFloat(MASSES.split(" ")[0]);
		vehicle.geometry.center = MASSES.split(" ").length == 2 ? parseFloat(MASSES.split(" ")[1]) : 0.5;
		vehicle.geometry.wheelbase = 2.6;
		vehicle.geometry.area = parseFloat(AERO.split(" ")[0]);
		vehicle.geometry.cd = parseFloat(AERO.split(" ")[1]);
		vehicle.geometry.cl = AERO.split(" ").length == 3 ? parseFloat(AERO.split(" ")[2]) : 0;

		// ENGINE
		engine.data = {
			power: {},
			torque: {}
		};

		var len = ENGINE.split(' ').length;
		engine.data.power.max = P = parseFloat(ENGINE.split(' ')[3]);
		engine.data.power.rpm = xP = parseFloat(ENGINE.split(' ')[4]);

		engine.data.torque.max = len >= 7 ? parseFloat(ENGINE.split(' ')[5]) : 7025*P/xP*1.2;
		engine.data.torque.rpm = len == 8 ? parseFloat(ENGINE.split(' ')[6]) : xP*(2-engine.data.torque.max*xP/P/7025);

		engine.max = parseFloat(ENGINE.split(' ')[len - 1]);
		engine.min = engine.max * 800 / 6500;

		var P = engine.data.power.max,
			xP = engine.data.power.rpm;

		if (ENGINE.split(' ')[2] == "E") {
			engine.data.description = "Electric";
		} else {
			engine.data.fuel = ENGINE.split(' ')[2][1];
			engine.data.aspiration = ENGINE.split(' ')[2][0];

			engine.data.description = {
				"D": "Diesel, ",
				"G": "Gasoline, "
			}[engine.data.fuel] || "Other";
	
			engine.data.description += {
				"N": " naturally aspirated",
				"S": " supercharged",
				"T": " turbocharged"
			}[engine.data.aspiration] || " other";
				
			if (ENGINE.split(' ')[2].includes("E"))
				engine.data.description += " hybrid";
		}

		engine.data.displacement = parseFloat(ENGINE.split(" ")[0]);
		engine.data.architecture = ENGINE.split(" ")[1];
		engine.data.cylinders = parseInt(ENGINE.split(" ")[1].replace(/[^0-9]/g, ''));
		// engine.inertia = engine.data.torque.max / 1000 * (1 + 0.5 * Math.exp(-1 * engine.data.power.max / 200));
		// engine.inertia = 0.25+Math.exp(-1*engine.data.power.max/engine.data.displacement/100);
		engine.inertia = engine.data.torque.max / 750 / (engine.max / 5000) / Math.sqrt(engine.data.power.max/engine.data.displacement/100);

		// TRANSMISSION
		transmission.data = {
			traction: (TRANSMISSION.split(" "))[0],
			desc: (TRANSMISSION.split(" "))[1],
			final: parseFloat(TRANSMISSION.split(" ")[2]),
			gears: [],
			limit: 0,
			speed: 0
		};
		
		transmission.final = transmission.data.final;

		for (var i = 3, ratio = 0; i < TRANSMISSION.split(" ").length; i++) {
			ratio = parseFloat(TRANSMISSION.split(" ")[i]);
			if (ratio > 0) {
				if (ratio < 20)
					transmission.data.gears[i - 3] = ratio;
				else
					transmission.data.limit = ratio;
			} else {
				transmission.data.reverse = ratio;
			}
		}
		
		transmission.data.speed = Math.pow(0.85 * 1000 * engine.mu * engine.data.power.max / 1.34 / (0.5 * 1.29 * vehicle.geometry.area * vehicle.geometry.cd), 1/3);
		transmission.data.speed = transmission.data.speed * 3.6;

		// TIRES
		tires.data = {};

		if (TIRES.split(" ").length == 1) {
			tires.data.front = TIRES.split(" ")[0];
			tires.data.rear = TIRES.split(" ")[0];
			tires.data.mu = tires.mu;
		} else if (TIRES.split(" ").length == 2) {
			tires.data.front = TIRES.split(" ")[0];
			if (TIRES.split(" ")[1].includes("R")) {
				tires.data.rear = TIRES.split(" ")[1];
				tires.data.mu = tires.mu;
			} else {
				tires.data.rear = TIRES.split(" ")[0];
				tires.data.mu = tires.mu = parseFloat(TIRES.split(" ")[1]);
			}
		} else if (TIRES.split(" ").length == 3) {
			tires.data.front = TIRES.split(" ")[0];
			tires.data.rear = TIRES.split(" ")[1];
			tires.data.mu = tires.mu = parseFloat(TIRES.split(" ")[2]);
		}
		
		var W = 0, Ar = 0, R = 0, d = transmission.data.traction == 'FWD' ? tires.data.front : tires.data.rear;
		
		W = d.split('/')[0];
		Ar = d.split('/')[1].split('R')[0].replace(/[^0-9.]/g, '');
		R = d.split('R')[1];

		tires.radius = (2 * W * Ar / 100 + R * 25.4)/1000/2;

		if (localStorage.getItem("cars/minimal transmission"))
			transmission.automatic = localStorage.getItem("cars/minimal transmission") == "true" ? true : false;

		log.print("Car defined successfully.");
		return car;
	}
}