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
		text += "<div><span>Brand</span><span>" + vehicle.data.brand + "</span></div>";
		text += "<div><span>Model</span><span>" + vehicle.data.model + "</span></div>";
		text += "<div><span>Year</span><span>" + vehicle.data.year + "</span></div>";
		text += "<div><span>Country</span><span>" + vehicle.data.country + "</span></div>";
		text += "</div>";
	
		text += "<h2>Engine</h2>";
		text += "<div>";
		text += "<div><span>Capacity</span><span>" + engine.data.displacement.toFixed(1) + " L</span></div>";
		text += "<div><span>Architecture</span><span>" + engine.data.architecture + "</span></div>";
		text += "<div><span>Fuel</span><span>" + engine.data.description + "</span></div>";
		text += "<div><span>Power</span><span>" + engine.data.power.max + " BHP (" + engine.data.power.rpm + " 1⁄min)</span></div>";
		text += "<div><span>Torque</span><span>" + engine.data.torque.max.toFixed() + " Nm (" + 50*Math.ceil(engine.data.torque.rpm/50) + " 1⁄min)</span></div>";
		text += "</div>";

		text += "<h2>Transmission</h2>";
		text += "<div>";
		text += "<div><span>Transmission</span><span>" + transmission.data.desc + transmission.data.gears.length + "</span></div>";
		text += "<div><span>Traction</span><span>" + transmission.data.traction + "</span></div>";
		text += "<div><span>Gear ratios</span></div>";
		for (var i = 0; i < transmission.data.gears.length; i++)
			text += "<div><span>" + (i+ 1) + "</span><span>" + transmission.data.gears[i].toFixed(2) + "</span></div>";
		text += "<div><span>R</span><span>" + transmission.data.reverse.toFixed(2) + "</span></div>";
		text += "<div><span>Final</span><span>" + transmission.data.final.toFixed(2) + "</span></div>";
		text += "</div>";
	
		text += "<h2>Tires</h2>";
		text += "<div>";
		text += "<div><span>Front</span><span>" + tires.data.front + "</span></div>";
		text += "<div><span>Rear</span><span>" + tires.data.rear + "</span></div>";
		text += "<div><span>Friction coefficient</span><span>" + tires.data.mu + "</span></div>";
		text += "</div>";

		text += "<h2>Geometry</h2>";
		text += "<div>";
		text += "<div><span>Mass</span><span>" + vehicle.geometry.mass + " kg</span></div>";
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

		document.getElementById("data").innerHTML = text;
	}
};