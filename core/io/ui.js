var ui = {
	tab: null,
	init: function () {
		ui.tabs.list();
		ui.tabs.help();
		ui.tabs.data();
		ui.cluster.onetime();
		ui.refresh();
	}, refresh: function () {
		ui.cluster.realtime();
		ui.tabs.shop();
	}, tabs: {
		list: function () {
			var name, link, text, number = 0;
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
			// text += "<div>" + number + " cars found.<a href='" + "#" + "'>" + "Not on the list?" + "</a></div>";
			document.getElementById('cars').innerHTML = text;	
		}, help: function () {
			var text = "";
			text += "<h1>Help</h1>";
			text += "<h2>Commands</h2>";
			text += "<div>";
			text += "<div><span>A</span><span>Brake</span></div>";
			text += "<div><span>S</span><span>Throttle</span></div>";
			text += "<div><span>M</span><span>Transmission</span></div>";
			text += "<div><span>&larr; , -</span><span>Gear down</span></div>";
			text += "<div><span>&crarr; , +</span><span>Gear up</span></div>";
			text += "<div><span>N</span><span>Neutral</span></div>";
			text += "<div><span>C</span><span>Cars</span></div>";
			text += "<div><span>D</span><span>Data</span></div>";
			text += "<div><span>H</span><span>Help</span></div>";
			text += "<div><span>?</span><span onclick='ui.random()'>Random car</span></div>";
			text += "</div>";
	
			document.getElementById('help').innerHTML = text;
		}, data: function () {
			var text = "";
	
			text += "<h1>Technical Data</h1>";
			/*
			text += "<h2>General</h2>";
			text += "<div>";
			text += "<div><span>Brand</span><span>" + car.general.brand + "</span></div>";
			text += "<div><span>Model</span><span>" + car.general.model + "</span></div>";
			text += "<div><span>Year</span><span>" + car.general.year + "</span></div>";
			text += "<div><span>Country</span><span>" + car.general.country + "</span></div>";
			text += "</div>";
			*/
		
			text += "<h2>Engine</h2>";
			text += "<div>";
			text += "<div><span>Capacity</span><span>" + info.engine.displacement('t') + "</span></div>";
			text += "<div><span>Architecture</span><span>" + info.engine.arch() + "</span></div>";
			text += "<div><span>Fuel</span><span>" + info.engine.fuel() + "</span></div>";
			text += "<div><span>Aspiration</span><span>" + info.engine.alim() + "</span></div>";
			text += "<div><span>Power</span><span>" + info.engine.Pmax() + "</span></div>";
			text += "<div><span>Torque</span><span>" + info.engine.Tmax() + "</span></div>";
			text += "</div>";
	
			text += "<h2>Transmission</h2>";
			text += "<div>";
			text += "<div><span>Transmission</span><span>" + info.transmission.type() + "</span></div>";
			text += "<div><span>Traction</span><span>" + info.transmission.traction() + "</span></div>";
			text += "<div><span>Gear ratios</span></div>";
			for (var i = 1; i < car.transmission.gears.length; i++)
				text += "<div><span>" + info.transmission.name(i) + "</span><span>" + info.transmission.ratio(i) + "</span></div>";
			text += "<div><span>Reverse</span><span>" + info.transmission.ratio(-1) + "</span></div>";
			text += "<div><span>Final</span><span>" + info.transmission.ratio(0) + "</span></div>";
			text += "</div>";
		
			text += "<h2>Tires</h2>";
			text += "<div>";
			text += "<div><span>Front</span><span>" + info.tires.deno('F') + "</span></div>";
			text += "<div><span>Rear</span><span>" + info.tires.deno('R') + "</span></div>";
			text += "<div><span>Speed rating</span><span>" + info.tires.speedrating() + " km/h</span></div>";
			text += "</div>";
	
			text += "<h2>Dimensions</h2>";
			text += "<div>";
			text += "<div><span>Mass</span><span>" + car.dimensions.mass.toFixed(0) + " kg</span></div>";
			text += "</div>";
	
			text += "<h2>Aerodynamics</h2>";
			text += "<div>";
			text += "<div><span>Cx</span><span>" + car.dimensions.cx.toFixed(2) + "</span></div>";
			text += "<div><span>Frontal area</span><span>" + car.dimensions.area.toFixed(2) + " m²</span></div>";
			text += "</div>";
	
			text += "<h2>Disclaimer</h2>";
			text += "<div>";
			text += "It is not guaranteed that all the information on this website is correct.<br>";
			text += "Data may change without notice.<br>";
			text += "All credits and rights to be attributed to respective owners.<br>";
			text += "</div>";
	
			document.getElementById("data").innerHTML = text;
		}, shop: function () {
			var t = "";
			t +="<h1>Workshop</h1>";
			t += "<div>"
				+ "<h2>Commands</h2>"
				+ "<div><span>Throttle</span><span>" + pedals.throttle.toFixed(2) + "</span></div>"
				+ "<div><span>Brake</span><span>" + pedals.brake.toFixed(2) + "</span></div>"
				+ "</div>";
			t += "<div>"
				+ "<h2>Engine</h2>"
				+ "<div><span>Speed</span><span>" + (50*Math.round(engine.rpm/50)) + " 1⁄min</span></div>"
				+ "<div><span>Power</span><span>" + engine.power().toFixed() + " HP</span></div>"
				+ "<div><span>Torque</span><span>" + engine.torque().toFixed() + " Nm</span></div>"
				+ "<div><span>Airflow</span><span>" + engine.airflow.toFixed(2) + "</span></div>"
				+ "<div><span>Injection</span><span>" + engine.injection.toFixed(2) + "</span></div>"
				+ "<div><span>Starting</span><span>" + engine.startup + "</span></div>"
				+ "<div><span>Inertia</span><span>" + (car.engine.J.toFixed(2)) + " kg m²</span></div>"
				+ "<div><span>Redline</span><span>" + (car.engine.rpm[5].toFixed()) + " 1⁄min</span></div>"
				+ "</div>";
			t += "<div>"
				+ "<h2>Transmission</h2>"
				+ "<div><span>Gear</span><span>" + transmission.name() + "</span></div>"
				+ "<div><span>Clutch pressure</span><span>" + clutch.clutch.toFixed(2) + "</span></div>"
				+ "<div><span>Clutch locked</span><span>" + clutch.engaged + "</span></div>"
				+ "<div><span>Automatic</span><span>" + transmission.automatic + "</span></div>"
				+ "<div><span>Upshift at</span><span>" + transmission.regime('+').toFixed() + " 1⁄min</span></div>"
				+ "<div><span>Downshift at</span><span>" + transmission.regime('-').toFixed() + " 1⁄min</span></div>"
				+ "<div><span>Speed limiter</span><span>"
					+ (transmission.limiter ? (car.transmission.limit).toFixed() : 0) + " km⁄h</span></div>"
				+ "</div>";
			t += "<div>"
				+ "<h2>Timing</h2>"
				+ "<div><span>0-100 km⁄h</span><span>" + time.chrono.TIME_0100.toFixed(1) + " s</span></div>"
				+ "<div><span>0-200 km⁄h</span><span>" + time.chrono.TIME_0200.toFixed(1) + " s</span></div>"
				+ "<div><span>1⁄4 mile</span><span>" + time.chrono.TIME_400M.toFixed(1) + " s</span></div>"
				+ "</div>";
			t += "<div>"
				+ "<h2>Physics</h2>"
				+ "<div><span>Distance</span><span>" + (vehicle.distance / 1000).toFixed(2) + " km</span></div>"
				+ "<div><span>Speed</span><span>"
					+ (3.6 * vehicle.speed).toFixed() + " km/h, "
					+ (vehicle.speed).toFixed(1) + " m⁄s</span></div>"
				+ "<div><span>Acceleration</span><span>"
					+ (vehicle.acceleration).toFixed(1) + " m⁄s²</span></div>"
				+ "<div><span>Friction coeff.</span><span>" + tires.f(vehicle.speed).toFixed(3) + "</span></div>"
				+ "<div><span>Traction coeff.</span><span>" + tires.mu.toFixed(2) + "</span></div>"
				+ "<div><span>Slope</span><span>" + road.slope.toFixed() + " deg</span></div>"
				+ "</div>";
			t += "<div>"
				+ "<h2>About</h2>"
				+ "<div><span>Cars no.</span><span>" + document.querySelectorAll("#cars * a").length + "</span></div>"
				+ "<div><span>Version</span><span>" + COMPILED.VER + "</span></div>"
				+ "<div><span>Compiled on </span><span>" + COMPILED.DATE + "</span></div>"
				+ "<div><span>Changelog</span><span>" + COMPILED.CHANGELOG + "</span></div>"
				+ "</div>";
			document.getElementById('shop').innerHTML = t;
		}
	}, display: function (m) {
		_DATA = m == "D" && document.getElementById('data').style.display != "block" ? 1 : 0;
		_CARS = m == "C" && document.getElementById('cars').style.display != "block" ? 1 : 0;
		_HELP = m == "H" && document.getElementById('help').style.display != "block" ? 1 : 0;
		_SHOP = m == "Y" && document.getElementById('shop').style.display != "block" ? 1 : 0;
		_TABS = (_DATA || _CARS || _HELP || _SHOP) ? 1 : 0;
		//document.getElementById('tabs').style.display = _TABS ? "block" : "none";
		document.getElementById('data').style.display = _DATA ? "block" : "none";
		document.getElementById('cars').style.display = _CARS ? "block" : "none";
		document.getElementById('help').style.display = _HELP ? "block" : "none";
		document.getElementById('shop').style.display = _SHOP ? "block" : "none";
		ui.tab = _TABS ? m : null;
	}, scroll: function (d) {
		alert(d)
		if (ui.tab = null)
			return;
		if (ui.tab == "D")
			document.getElementById('data').scrollTop += 20 ;
		if (ui.tab == "C")
			document.getElementById('cars').scrollTop += 20 ;
		if (ui.tab == "H")
			document.getElementById('help').scrollTop += 20 ;
		if (ui.tab == "E")
			document.getElementById('log').scrollTop += 20 ;
			console.log(document.getElementById('data').scrollTop)
	}, random: function () {
		var a = document.querySelectorAll("#cars * a");
		a = a[Math.floor(Math.random()*a.length)].href
		window.location = a;
	}
}