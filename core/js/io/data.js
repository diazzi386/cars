var data = {
	request: {
		file: null,
		car: null,
		error: false,
	}, history: {
		file: null,
		car: null,
	}, cars: [],
	load: function () {
		console.log("Loading...");
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
		console.log("File requested: '/cars/" + data.request.file + ".js'...");
	}, success: function () {
		localStorage.setItem("cars/minimal/data/request/file", data.request.file);
		console.log("File successfully loaded.");

		if (!cars)
			return console.log("0 cars found.");

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

		console.log(data.cars.length + " cars found.");
		console.log("Searching for car: '" + data.request.car + "'...");

		for (var i in data.cars) {
			if (data.request.car == data.cars[i]) {
				console.log("Found!");
				localStorage.setItem("cars/minimal/data/request/car/" + data.request.file, data.request.car);
				return io.init();
			}		
		}

		data.request.error = true;
		data.redirect();
	}, almost: function () {
		console.log("File not found.");
		data.request.file = data.history.file;
		var script = document.createElement('script');
		script.src = "./cars/" + data.request.file + ".js";
		script.onload = data.success;
		script.onerror = data.fail;
		document.head.appendChild(script);
		console.log("File requested: '/cars/" + data.request.file + ".js'...");
	}, fail: function () {
		return window.location = "?Diazzi";
	}, redirect: function (random = false) {
		if (data.request.error || random || !localStorage.getItem("cars/minimal/data/request/car/" + data.request.file))
			return window.location = "?" + data.cars[Math.floor(Math.random()*data.cars.length)];
		else
			return window.location = "?" + localStorage.getItem("cars/minimal/data/request/car/" + data.request.file);
	}, parse: function () {
        console.log("Parsing car data...");
		vehicle.brand = data.request.car.split('/')[0].replace(/_/g, " ");
		vehicle.serie = data.request.car.split('/')[1].replace(/_/g, " ");
		vehicle.year = data.request.car.split('/')[2];
		vehicle.model = data.request.car.split('/')[3].replace(/_/g, " ");
		vehicle.country = cars[vehicle.brand].country;
		document.title = vehicle.brand + " " + vehicle.model + " '" + (vehicle.year%100).toFixed().padStart(2, "0");
		var car = cars[vehicle.brand][vehicle.serie][vehicle.year + " " + vehicle.model];

		// Engine
		var text = car.split("; ")[0];
		engine.power.max = parseFloat(text.split(' ')[3]);
		engine.power.rpm = parseFloat(text.split(' ')[4]);
		engine.torque.max = parseFloat(text.split(' ')[5]);
		engine.torque.rpm = parseFloat(text.split(' ')[6]);
		engine.min = parseFloat(text.split(' ')[7]);
		engine.max = parseFloat(text.split(' ')[8]);

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
		// engine.inertia = 0.1 * engine.displacement * engine.torque.max / engine.power.max;
		engine.inertia = 0.001 * engine.torque.max * engine.torque.max / engine.power.max;

		// Transmission
		var text = car.split("; ")[1];
		transmission.drive = (text.split(" "))[0];
		transmission.mu = {
			"F": 0.9,
			"R": 0.85,
			"A": 0.8
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

		// Tires
		var text = car.split("; ")[2];
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

		// Geometry
		var text = car.split("; ")[3];
		vehicle.geometry.mass = parseFloat(text.split(" ")[0]);
		vehicle.geometry.center = parseFloat(text.split(" ")[1]);
		vehicle.geometry.wheelbase = parseFloat(text.split(" ")[2]);
		vehicle.geometry.area = parseFloat(text.split(" ")[3]);
		vehicle.geometry.cd = parseFloat(text.split(" ")[4]);
		vehicle.geometry.cl = text.split(" ").length == 6 ? parseFloat(text.split(" ")[5]) : 0;
		
		vehicle.maxSpeed = 3.6 * Math.pow(1000 * transmission.mu * engine.mu * engine.power.max / 1.34 / (0.5 * 1.29 * vehicle.geometry.area * vehicle.geometry.cd), 1/3);

		console.log("Car defined successfully.");
		return car;
	}
};

var menu = {
	show: {
		cars: false,
		data: false,
		help: false
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
		var name, link, text;
		number = 0;
		text = "<h1>Available cars</h1>";
		// text += "<input type='text' id='search'>";
		for (var i in cars) {
			text += "<h2>" + i + "</h2>";
			for (var j in cars[i]) {
				if (j == "country")
					continue;
				text += "<div>";
				text += "<h3>" + j + "</h3>";
				for (var l in cars[i][j]) {
					name = l.substr(5) + " '" + l.substr(2,2);
					link = "?" + i + "/" + j + "/" + l.substr(0, 4) + "/" + l.substr(5);
					link = link.replace(/ /g, "_");
					text +=
						"<a href='" + link + "'>" + name + "</a>";
					number++;
				}
				text += "</div>";
			}
		}

		text += "<div class='muted'>" + number + " cars found.<a href='" + "#" + "'>" + "Not on the list?" + "</a></div>";
		document.getElementById('cars').innerHTML = text;	
	}, help: function () {
		var text = "";
		text += "<h1>Help</h1>";
		text += "<h2>Commands</h2>";
		text += "<h3>Pedals</h3>";
		text += "<div>";
		text += "<div><span>Q</span><span>Clutch</span></div>";
		text += "<div><span>A</span><span>Brake</span></div>";
		text += "<div><span>S</span><span>Throttle</span></div>";
		text += "</div>";
		text += "<h3>Transmission</h3>";
		text += "<div>";
		text += "<div><span>T</span><span>Automatic &frasl; Manual</span></div>";
		text += "<div><span>&larr;</span><span>Gear down</span></div>";
		text += "<div><span>&crarr;</span><span>Gear up</span></div>";
		text += "</div>";
		text += "<h3>Driving mode</h3>";
		text += "<div>";
		text += "<div><span>&uarr;</span><span>Sport</span></div>";
		text += "<div><span>&darr;</span><span>Comfort</span></div>";
		text += "</div>";
		text += "<h3>Menu</h3>";
		text += "<div>";
		text += "<div><span>C</span><span>Cars</span></div>";
		text += "<div><span>D</span><span>Data</span></div>";
		text += "<div><span>H</span><span>Help</span></div>";
		text += "</div>";
		text += "<h3>Other</h3>";
		text += "<div>";
		text += "<div><span>?</span><span onclick='ui.random()'>Random car</span></div>";
		text += "</div>";

		document.getElementById('help').innerHTML = text;
	}, data: function () {
		var text = "";

		text += "<h1>Technical Data</h1>";
		text += "<h2>General</h2>";
		text += "<div>";
		text += "<div><span>Brand</span><span>" + vehicle.brand + "</span></div>";
		text += "<div><span>Model</span><span>" + vehicle.model + "</span></div>";
		text += "<div><span>Year</span><span>" + vehicle.year + "</span></div>";
		text += "<div><span>Country</span><span>" + vehicle.country + "</span></div>";
		text += "</div>";
	
		text += "<h2>Engine</h2>";
		text += "<div>";
		text += "<div><span>Capacity</span><span>" + engine.displacement.toFixed(1) + " L</span></div>";
		text += "<div><span>Architecture</span><span>" + engine.architecture + "</span></div>";
		text += "<div><span>Fuel</span><span>" + engine.description + "</span></div>";
		text += "<div><span>Power</span><span>" + engine.power.max + " BHP (" + engine.power.rpm + " 1⁄min)</span></div>";
		text += "<div><span>Torque</span><span>" + engine.torque.max.toFixed() + " Nm (" + 50*Math.ceil(engine.torque.rpm/50) + " 1⁄min)</span></div>";
		text += "</div>";

		text += "<h2>Transmission</h2>";
		text += "<div>";
		text += "<div><span>Transmission</span><span>" + transmission.type + transmission.gears.length + "</span></div>";
		text += "<div><span>Gear ratios</span></div>";
		for (var i = 0; i < transmission.gears.length; i++)
			text += "<div><span>" + (i+ 1) + "</span><span>" + transmission.gears[i].toFixed(2) + "</span></div>";
		text += "<div><span>R</span><span>" + transmission.reverse.toFixed(2) + "</span></div>";
		text += "<div><span>Final</span><span>" + transmission.final.toFixed(2) + "</span></div>";
		text += "</div>";
	
		text += "<h2>Tires</h2>";
		text += "<div>";
		text += "<div><span>Traction</span><span>" + transmission.drive + "WD</span></div>";
		text += "<div><span>Front</span><span>" + tires.front + "</span></div>";
		text += "<div><span>Rear</span><span>" + tires.rear + "</span></div>";
		text += "<div><span>Friction coefficient</span><span>" + tires.mu + "</span></div>";
		text += "</div>";

		text += "<h2>Geometry</h2>";
		text += "<div>";
		text += "<div><span>Mass</span><span>" + vehicle.geometry.mass + " kg</span></div>";
		text += "<div><span>Wheelbase</span><span>" + vehicle.geometry.wheelbase.toFixed(1) + " m</span></div>";
		text += "<div><span>Weight distribution</span><span>" + (vehicle.geometry.center*100).toFixed() + "% front</span></div>";
		text += "<div><span>Frontal area</span><span>" + vehicle.geometry.area.toFixed(2) + " m&sup2;</span></div>";
		text += "<div><span>Aerodynamic drag coefficient</span><span>" + vehicle.geometry.cd.toFixed(2) + "</span></div>";
		text += "<div><span>Aerodynamic lift coefficient</span><span>" + vehicle.geometry.cl.toFixed(2) + "</span></div>";
		text += "</div>";

		text += "<h2 class='muted'>Disclaimer</h2>";
		text += "<div class='muted'>";
		text += "It is not guaranteed that all the information on this website is correct.<br>";
		text += "Data may change without notice.<br>";
		text += "All credits and rights to be attributed to respective owners.<br>";
		text += "</div>";
		text += "<div class='muted'>";
		text += "<div><span>Version</span><span>" + io.version + "</span></div>";
		text += "</div>";

		document.getElementById("data").innerHTML = text;
	}
};