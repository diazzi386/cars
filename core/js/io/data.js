var data = {
	request: null,
	requests: {},
	error: false,
	missing: false,
	links: [],
	filter: null,
	search: function () {
		data.request = window.location.href.split("?c=")[1];

		if (!data.request)
			data.missing = true;

		data.request = data.request || localStorage.getItem("cars/minimal/data/request/car");

		if (data.missing)
			window.location.href += (window.location.href.includes("?") ? "&" : "?") + "c=" + data.request;

		if (!cars)
			return console.error("Error loading cars file!");

		var link;
		for (var i in cars) {
			for (var j in cars[i]) {
				for (var l in cars[i][j]) {
					link = (i + "/" + j + "/" + l).replace(/ /g, "_");
					data.links.push(link);
				}
			}
		}

		console.log(data.links.length + " cars found.");
				
		console.log("Searching for car: '" + data.request + "'...");

		for (var i in data.links) {
			if (data.request == data.links[i]) {
				console.log("Found!");
				localStorage.setItem("cars/minimal/data/request/car", data.request);
				return;
			}		
		}

		data.redirect();
	}, filter: function () {
		return false;
	}, redirect: function () {
		return window.location = "?c=" + data.links[Math.floor(Math.random()*data.links.length)];
	}, parse: function () {
		console.log("Parsing car data...");
		vehicle.brand = data.request.split('/')[0].replace(/_/g, " ");
		vehicle.serie = data.request.split('/')[1].replace(/_/g, " ");
		vehicle.model = data.request.split('/')[2].replace(/_/g, " ").slice(0, -5);
		vehicle.year = data.request.slice(-4);
		document.title = vehicle.brand + " " + vehicle.model + " " + vehicle.year;
		document.getElementById("title").innerHTML = document.title;
		var car = cars[vehicle.brand][vehicle.serie][vehicle.model + " " + vehicle.year];
		if (!car)
			console.error("Car not defined!");

		// Engine
		var text;
		text = car.split("; ")[0];
		engine.power.max = parseFloat(text.split(' ')[3]);
		engine.power.rpm = parseFloat(text.split(' ')[4]);
		engine.torque.max = parseFloat(text.split(' ')[5]);
		engine.torque.rpm = parseFloat(text.split(' ')[6]);
		engine.rpm.min = parseFloat(text.split(' ')[7]);
		engine.rpm.max = parseFloat(text.split(' ')[8]);
		engine.rpm.now = 0;

		engine.aspiration = text.split(' ')[2][0];
		engine.fuel = text.split(' ')[2][1];

		engine.description = {
			"D": "Diesel",
			"G": "Gasoline"
		}[engine.fuel] + " " + {
			"N": " naturally aspirated",
			"S": " supercharged",
			"T": " turbocharged"
		}[engine.aspiration];

		engine.displacement = parseFloat(text.split(" ")[0]);
		engine.architecture = text.split(" ")[1];
		engine.cylinders = parseInt(text.split(" ")[1].replace(/[^0-9]/g, ''));
		// engine.inertia = 0.001 * engine.torque.max * engine.torque.max / engine.power.max;
		engine.inertia = 0.00075 * engine.torque.max * engine.torque.max / engine.power.max;

		// Transmission
		text = car.split("; ")[1];
		transmission.drive = (text.split(" "))[0];
		transmission.mu = {
			"F": 0.9,
			"R": 0.85,
			"A": 0.75
		}[transmission.drive];
		transmission.type = (text.split(" "))[1];
		transmission.final = parseFloat(text.split(" ")[2]);
		transmission.gears = [];

		for (var i = 3; i < text.split(" ").length - 1; i++) {
			transmission.gears[i - 3] = parseFloat(text.split(" ")[i]);
		}

		transmission.reverse = parseFloat(text.split(" ")[3 + transmission.gears.length]);

		if (localStorage.getItem("cars/minimal transmission"))
			transmission.automatic = localStorage.getItem("cars/minimal transmission") == "true" ? true : false;
		if (localStorage.getItem("cars/minimal sport"))
			pedals.sport = localStorage.getItem("cars/minimal sport") == "true" ? true : false;
		data.filter = "" || localStorage.getItem("cars/minimal filter");

		// Tires
		text = car.split("; ")[2];
		tires.front = tires.rear = text.split(" ")[0];
		if (text.split(" ").length == 2)
			tires.mu = parseFloat(text.split(" ")[1]);
		else if (text.split(" ").length == 3) {
			tires.rear = text.split(" ")[1];
			tires.mu = parseFloat(text.split(" ")[2]);
		}
		
		var W = 0, Ar = 0, R = 0, d = transmission.drive == 'F' ? tires.front : tires.rear;
		
		W = d.split('/')[0];
		Ar = d.split('/')[1].split('R')[0].replace(/[^0-9.]/g, '');
		R = d.split('R')[1];

		tires.radius = (2 * W * Ar / 100 + R * 25.4)/1000/2;

		tires.inertia = 30 * tires.radius * tires.radius / 2;

		// Geometry
		text = car.split("; ")[3];
		vehicle.geometry.mass = parseFloat(text.split(" ")[0]);
		vehicle.geometry.center = parseFloat(text.split(" ")[1]);
		vehicle.geometry.wheelbase = parseFloat(text.split(" ")[2]);

		// Aerodynamics
		text = car.split("; ")[4];
		vehicle.geometry.area = parseFloat(text.split(" ")[0]);
		vehicle.geometry.cd = parseFloat(text.split(" ")[1]);
		// vehicle.geometry.cl = text.split(" ").length == 6 ? parseFloat(text.split(" ")[5]) : 0;
		
		vehicle.maxSpeed = 3.6 * Math.pow(1000 * transmission.mu * engine.mu * engine.power.max / 1.34 / (0.5 * 1.29 * vehicle.geometry.area * vehicle.geometry.cd), 1/3);

		console.log("Car defined successfully.");
		return car;
	}
};

var menu = {
	show: {
		cars: false,
		data: false,
		help: false,
		shop: false,
	}, display: function (selection) {
		for (var i in menu.show) {
			if (selection == i) {
				menu.show[i] = !menu.show[i];
				document.getElementById(i).style.display = menu.show[i] ? "block" : "none";
			} else {
				menu.show[i] = false;
				document.getElementById(i).style.display = "none";
			}
		}
	}, init: function () {
		menu.help();
		menu.cars();
		menu.data();
	}, cars: function () {
		var name, total = 0, filtered = 0, list = {},
			filter = document.getElementById("search") ? document.getElementById("search").value : data.filter;
		
		localStorage.setItem("cars/minimal filter", data.filter = filter);
		
		for (var i in cars) {
			for (var j in cars[i]) {
				for (var l in cars[i][j]) {
					total++;
					if ((i + " " + j + " " + l).toLowerCase().includes(filter.toLowerCase())) {
						if (!list[i])
							list[i] = {};
						if (!list[i][j])
							list[i][j] = {};
						list[i][j][l] = (i + "/" + j + "/" + l).replace(/ /g, "_");
						filtered++;
					}
				}
			}
		}

		var text = "<h1>Cars</h1>";
		text += '<a title="Close page" onclick="keyboard.choose(\'Escape\');"><u>Esc</u> to close</a>';
		text += "<div><input type='text' id='search' placeholder='Filter' autocomplete='off' onchange='menu.cars()' value='" + filter + "'></div>";

		for (var i in list) {
			text += "<h2 class='collapse'>" + i + "</h2>";
			text += "<div style='display: block'>";
			for (var j in list[i]) {
				text += "<h3>" + j + "</h3>";
				for (var l in list[i][j]) {
					text += "<a href='?c=" + list[i][j][l] + "' title='" + i  + " " + l + "'>" + l + "</a>";
				}
			}
			text += "</div>";
		}

		text += "<div class='muted' style='margin-top: 20px;'>" + filtered + (filtered == 1 ? " car " : " cars ") + "filtered out of " + total + " total. <a href='" + "#" + "'>" + "Not on the list?" + "</a></div>";
		document.getElementById('cars').innerHTML = text;
	}, help: function () {
		var text = "<h1>Help</h1>";
		text += '<a title="Close page" onclick="keyboard.choose(\'Escape\');"><u>Esc</u> to close</a>';
		text += "<h2>Commands</h2>";
		text += "<h3>Pedals</h3>";
		text += "<div><span>Q</span><span>Clutch</span></div>";
		text += "<div><span>A</span><span>Brake</span></div>";
		text += "<div><span>S</span><span>Throttle</span></div>";
		text += "<h3>Transmission</h3>";
		text += "<div><span>T</span><span>Automatic &frasl; Manual</span></div>";
		text += "<div><span>M</span><span>Comfort &frasl; Sport</span></div>";
		text += "<div><span>&larr;</span><span>Gear down</span></div>";
		text += "<div><span>&crarr;</span><span>Gear up</span></div>";
		text += "<h3>Menu</h3>";
		text += "<div><span>C</span><span>Cars</span></div>";
		text += "<div><span>D</span><span>Data</span></div>";
		text += "<div><span>H</span><span>Help</span></div>";
		text += "<h3>Other</h3>";
		text += "<div><span>?</span><span onclick='ui.random()'>Random car</span></div>";
		document.getElementById('help').innerHTML = text;
	}, data: function () {
		var text = "<h1>Data</h1>";
		text += '<a title="Close page" onclick="keyboard.choose(\'Escape\');"><u>Esc</u> to close</a>';
		text += "<h2>" + document.title + "</h2>";
		text += "<h3>Engine</h3>";
		text += "<div><span>Capacity</span><span>" + engine.displacement.toFixed(1) + " L</span></div>";
		text += "<div><span>Architecture</span><span>" + engine.architecture + "</span></div>";
		text += "<div><span>Fuel</span><span>" + engine.description + "</span></div>";
		text += "<div><span>Power</span><span>" + engine.power.max + " HP (" + engine.power.rpm + " 1⁄min)</span></div>";
		text += "<div><span>Torque</span><span>" + engine.torque.max.toFixed() + " Nm (" + 50*Math.ceil(engine.torque.rpm/50) + " 1⁄min)</span></div>";
		text += "<div><span>Redline</span><span>" + engine.rpm.max.toFixed() + " Nm (" + 50*Math.ceil(engine.torque.rpm/50) + " 1⁄min)</span></div>";
		text += "<h3>Transmission</h3>";
		text += "<div><span>Transmission</span><span>" + transmission.type + transmission.gears.length + "</span></div>";
		text += "<div><span>Drive</span><span>" + transmission.drive + "WD</span></div>";
		text += "<div><span>Gear ratios</span></div>";
		for (var i = 0; i < transmission.gears.length; i++)
			text += "<div><span>" + (i+ 1) + "</span><span>" + transmission.gears[i].toFixed(2) + "</span></div>";
		text += "<div><span>R</span><span>" + transmission.reverse.toFixed(2) + "</span></div>";
		text += "<div><span>Final</span><span>" + transmission.final.toFixed(2) + "</span></div>";	
		text += "<h3>Tires</h3>";
		text += "<div><span>Front</span><span>" + tires.front + "</span></div>";
		text += "<div><span>Rear</span><span>" + tires.rear + "</span></div>";
		text += "<div><span>Friction coefficient</span><span>" + tires.mu.toFixed(1) + "</span></div>";
		text += "<h3>Geometry</h3>";
		text += "<div><span>Mass</span><span>" + vehicle.geometry.mass + " kg</span></div>";
		text += "<div><span>Wheelbase</span><span>" + vehicle.geometry.wheelbase.toFixed(1) + " m</span></div>";
		text += "<div><span>Weight distribution</span><span>" + (vehicle.geometry.center*100).toFixed() + "% front</span></div>";
		text += "<h3>Aerodynamics</h3>";
		text += "<div><span>Frontal area</span><span>" + vehicle.geometry.area.toFixed(2) + " m&sup2;</span></div>";
		text += "<div><span>Drag coefficient</span><span>" + vehicle.geometry.cd.toFixed(2) + "</span></div>";
		text += "<div><span>Lift coefficient</span><span>" + vehicle.geometry.cl.toFixed(2) + "</span></div>";
		text += "<h3>Disclaimer</h3>";
		text += "<div>";
		text += "It is not guaranteed that all the information on this website is correct.<br>";
		text += "Data may change without notice.<br>";
		text += "All credits and rights to be attributed to respective owners.<br>";
		text += "</div>";
		document.getElementById("data").innerHTML = text;
	}, shop: function () {
		var text = "<h1>Shop</h1>";
		text += '<a title="Close page" onclick="keyboard.choose(\'Escape\');"><u>Esc</u> to close</a>';
		text += "<h3>Pedals</h3>";
		text += "<div><span>Throttle</span><span>" + pedals.throttle.toFixed(2) + "</span></div>";
		text += "<div><span>Brake</span><span>" + pedals.brake.toFixed(2) + "</span></div>";
		text += "<div><span>Clutch</span><span>" + pedals.clutch.toFixed(2) + "</span></div>";
		text += "<div><span>Sport mode</span><span>" + pedals.sport + "</span></div>";
		text += "<div><span>Electronic controls</span><span>" + pedals.electronics + "</span></div>";
		text += "<h3>Engine</h3>";
		text += "<div><span>Speed</span><span>" + (Math.round(engine.rpm.now/50)*50) + " 1⁄min</span></div>";
		text += "<div><span>Power</span><span>" + Math.min(Math.round(engine.power.now/5)*5, engine.power.max) + " HP</span></div>";
		text += "<div><span>Torque</span><span>" + Math.min(Math.round(engine.torque.now/5)*5, engine.torque.max) + " Nm</span></div>";
		text += "<h3>Transmission</h3>";
		text += "<div><span>Gear</span><span>" + transmission.name() + "</span></div>";
		text += "<div><span>Auto</span><span>" + transmission.automatic + "</span></div>";
		text += "<div><span>Upshift at</span><span>" + transmission.tables.up().toFixed() + " 1⁄min</span></div>";
		text += "<div><span>Downshift at</span><span>" + transmission.tables.down().toFixed() + " 1⁄min</span></div>"
		text += "<h3>Physics</h3>";
		text += "<div><span>Distance</span><span>" + (vehicle.distance / 1000).toFixed(2) + " km</span></div>";
		text += "<div><span>Speed</span><span>"
			+ (3.6 * vehicle.speed).toFixed() + " km⁄h, "
			+ (vehicle.speed).toFixed(1) + " m⁄s</span></div>";
		text += "<div><span>Acceleration</span><span>" + vehicle.acceleration.toFixed(1) + " m⁄s², "
			+ (vehicle.acceleration/9.8).toFixed(2) + " g</span></div>";
		text += "<h3>Timing</h3>";
		if (!time.speed.times[20] && !time.distance.times[100])
			text += "<div>No acceleration times for now!</div>";
		for (var i = 0; i <= 400; i += 20)
			if (time.speed.times[i])
				text += "<div><span>0-" + i + " km⁄h</span><span>" + time.speed.times[i].toFixed(2) + " s</span></div>";
		for (var i = 100; i <= 1600; i *= 2)
			if (time.distance.times[i])
				text += "<div><span>" + i + " m</span><span>" + time.distance.times[i].toFixed(2) + " s</span></div>";
		text += "<h3>Sound</h3>";
		text += "<div><span>Fundamental frequency</span><span>" + sound.oscillators[0].frequency.value.toFixed() + " Hz</span></div>";
		text += "<div><span>Master volume</span><span>" + sound.master.gain.value.toFixed(2) + " dB</span></div>";
		text += "<div><span>Bandpass filter frequency</span><span>" + sound.bandpass.frequency.value.toFixed() + " Hz</span></div>";
		text += "<div><span>Bandpass filter Q</span><span>" + sound.bandpass.Q.value.toFixed(2) + "</span></div>";
		text += "<h3>Graphics</h3>";
		text += "<div><span>Frame rate </span><span>" + (1/time.delta).toFixed() + " Hz</span></div>";
		text += "<h3>About</h3>";
		text += "<div><span>Cars no.</span><span>" + data.links.length + "</span></div>";
		text += "<div><span>Version</span><span>" + io.version + "</span></div>";
		text += "<div><span>Compiled on </span><span>" + io.compiled + "</span></div>";
		/*
		// t += "<div><span>Air flow</span><span>" + engine.airflow.toFixed(2) + "</span></div>";
		// t += "<div><span>Injection</span><span>" + engine.injection.toFixed(2) + "</span></div>";
		// t += "<div><span>Starting</span><span>" + engine.startup + "</span></div>";
		// t += "<div><span>Inertia</span><span>" + (car.engine.J.toFixed(2)) + " kg m²</span></div>";
		t += "<div><span>Redline</span><span>" + (engine.rpm.max.toFixed()) + " 1⁄min</span></div>";
		t += "</div>";
		t += "<div>";
		t += "<h2>Transmission</h2>";
		t += "<div><span>Gear</span><span>" + transmission.gear + "</span></div>";
		// t += "<div><span>Clutch pressure</span><span>" + clutch.clutch.toFixed(2) + "</span></div>";
		// t += "<div><span>Clutch locked</span><span>" + clutch.engaged + "</span></div>";
		// t += "<div><span>Automatic</span><span>" + transmission.automatic + "</span></div>";
		// t += "<div><span>Upshift at</span><span>" + transmission.regime('+').toFixed() + " 1⁄min</span></div>";
		// t += "<div><span>Downshift at</span><span>" + transmission.regime('-').toFixed() + " 1⁄min</span></div>";
		// t += "<div><span>Speed limiter</span><span>"
		// 		+ (transmission.limiter ? (car.transmission.limit).toFixed() : 0) + " km⁄h</span></div>";
		t += "</div>";
		t += "<div>";
		t += "<h2>Timing</h2>";
		// t += "<div><span>0-100 km⁄h</span><span>" + time.chrono.TIME_0100.toFixed(1) + " s</span></div>";
		// t += "<div><span>0-200 km⁄h</span><span>" + time.chrono.TIME_0200.toFixed(1) + " s</span></div>";
		// t += "<div><span>1⁄4 mile</span><span>" + time.chrono.TIME_400M.toFixed(1) + " s</span></div>";
		t += "</div>";
		t += "<div>";
		t += "<h2>Physics</h2>";
		t += "<div><span>Distance</span><span>" + (vehicle.distance / 1000).toFixed(2) + " km</span></div>";
		t += "<div><span>Speed</span><span>"
				+ (3.6 * vehicle.speed).toFixed() + " km/h, "
				+ (vehicle.speed).toFixed(1) + " m⁄s</span></div>";
		t += "<div><span>Acceleration</span><span>"
				+ (vehicle.acceleration).toFixed(1) + " m⁄s²</span></div>";
		t += "<div><span>Friction coeff.</span><span>" + tires.f(vehicle.speed).toFixed(3) + "</span></div>";
		t += "<div><span>Traction coeff.</span><span>" + tires.mu.toFixed(2) + "</span></div>";
		t += "<div><span>Slope</span><span>" + road.slope.toFixed() + " deg</span></div>";
		t += "</div>";
		t += "<div>";
		t += "<h2>About</h2>";
		t += "<div><span>Cars no.</span><span>" + document.querySelectorAll("#cars * a").length + "</span></div>";
		t += "<div><span>Version</span><span>" + COMPILED.VER + "</span></div>";
		t += "<div><span>Compiled on </span><span>" + COMPILED.DATE + "</span></div>";
		t += "<div><span>Changelog</span><span>" + COMPILED.CHANGELOG + "</span></div>";
		t += "</div>";
		*/
		document.getElementById('shop').innerHTML = text;
	}
};