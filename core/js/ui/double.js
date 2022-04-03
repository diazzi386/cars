var ui = {
	rpm: {
		limit: 0,
		div: 0
	}, kmh: {
		limit: 0,
		div: 0
	}, init: function () {
		var canvas = document.getElementById('init');
		var context = canvas.getContext('2d');
		var w = canvas.width;
		var h = canvas.height;

		context.clearRect(0, 0, w, h);

		ui.rpm.limit = 1000 * Math.ceil((engine.max + 500)/1000);
		ui.kmh.limit = vehicle.maxSpeed;
		ui.kmh.limit = Math.min(Math.max(220, ui.kmh.limit), 330);

		if (ui.kmh.limit <= 240)
			ui.kmh.div = 20;
		else
			ui.kmh.div = 30;

		ui.kmh.limit = ui.kmh.div * Math.ceil(ui.kmh.limit / ui.kmh.div);
 
		context.lineWidth = 15;
		context.strokeStyle = "rgba(255, 255, 255, 0.1)";

		context.beginPath();
		context.arc(350 - 120, 175, 105, 0.75 * Math.PI, 2.25 * Math.PI);
		context.stroke();

		context.beginPath();
		context.arc(350 + 120, 175, 105, 0.75 * Math.PI, 2.25 * Math.PI);
		context.stroke();

		context.lineWidth = 2;
		context.strokeStyle = "white";
		context.fillStyle = "white";

		for (var i = 0; i <= ui.rpm.limit; i += 500) {
			var teta = (0.75 + i / ui.rpm.limit * 1.5) * Math.PI;
			context.lineWidth = i % 1000 == 0 ? 3 : 2;
			context.strokeStyle = i > engine.max - 500 ? "firebrick" : "white";
			context.beginPath();
			context.moveTo(350 - 120 + (i % 1000 == 0 ? 84 : 86) * Math.cos(teta), 175 + (i % 1000 == 0 ? 84 : 86) * Math.sin(teta));
			context.lineTo(350 - 120 + 90 * Math.cos(teta), 175 + 90 * Math.sin(teta));
			context.stroke();
		}

		context.strokeStyle = "white";

		for (var i = 0; i <= ui.kmh.limit; i += 10) {
			var teta = (0.75 + i / ui.kmh.limit * 1.5) * Math.PI;
			context.lineWidth = i % ui.kmh.div == 0 ? 3 : 2;
			context.beginPath();
			context.moveTo(350 + 120 + (i % ui.kmh.div == 0 ? 84 : 86) * Math.cos(teta), 175 + (i % ui.kmh.div == 0 ? 84 : 86) * Math.sin(teta));
			context.lineTo(350 + 120 + 90 * Math.cos(teta), 175 + 90 * Math.sin(teta));
			context.stroke();
		}

		context.textBaseline = "middle";
		context.textAlign = "center";
		context.font = "700 16px 'Inter', sans-serif";

		for (var i = 0; i <= ui.rpm.limit; i += 1000) {
			context.fillStyle = i > engine.max - 500 ? "firebrick" : "white";
			var teta = (0.75 + i / ui.rpm.limit * 1.5) * Math.PI;
			context.fillText(i/1000, 350 - 120 + 67 * Math.cos(teta), 175 + 67 * Math.sin(teta));
		}

		context.font = "700 12px 'Inter', sans-serif";
		context.fillStyle = "white";

		for (var i = 0; i <= ui.kmh.limit; i += ui.kmh.div) {
			var teta = (0.75 + i / ui.kmh.limit * 1.5) * Math.PI;
			context.fillText(i, 350 + 120 + 67 * Math.cos(teta), 175 + 67 * Math.sin(teta));
		}

		context.strokeStyle = "white";
		context.fillStyle = "white";
		context.font = "900 24px 'Inter', sans-serif";
		context.textAlign = "center";
		context.textBaseline = "alphabetic";
		context.fillText(document.title, 350, 175 + 125);
	}, refresh: function () {
		var canvas = document.getElementById('realtime');
		var context = canvas.getContext('2d');
		var w = canvas.width;
		var h = canvas.height;

		context.clearRect(0, 0, w, h);

		var rpm = Math.min(engine.rpm, ui.rpm.limit);
		var kmh = Math.min(Math.abs(vehicle.speed * 3.6), ui.kmh.limit);

		context.lineWidth = 15;
		context.strokeStyle = "firebrick";
		var teta = (0.75 + rpm / ui.rpm.limit * 1.5) * Math.PI;
		context.beginPath();
		context.arc(350 - 120, 175, 105, 0.75 * Math.PI, teta);
		context.stroke();

		context.lineWidth = 5;
		context.strokeStyle = "rgba(255, 255, 255, 0.2)";
		context.beginPath();
		context.arc(350 - 120, 175, 100, 0.75 * Math.PI, teta);
		context.stroke();

		context.lineWidth = 15;
		context.strokeStyle = "firebrick";
		var teta = (0.75 + kmh / ui.kmh.limit * 1.5) * Math.PI;
		context.beginPath();
		context.arc(350 + 120, 175, 105, 0.75 * Math.PI, teta);
		context.stroke();

		context.lineWidth = 5;
		context.strokeStyle = "rgba(255, 255, 255, 0.2)";
		context.beginPath();
		context.arc(350 + 120, 175, 100, 0.75 * Math.PI, teta);
		context.stroke();

		context.fillStyle = "white";
		var name = "";
		if (transmission.gear == 0)
			name = "N";
		else if (transmission.gear == -1)
			name = "R";
		else if (transmission.automatic)
			name = (transmission.logic > 1 ? "S" : "D") + transmission.gear;
		else
			name = "M" + transmission.gear;
		
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.font = "900 48px 'Inter', sans-serif";
		context.fillText(name, 350 - 120, 175);
		context.fillText((vehicle.speed*3.6).toFixed(), 350 + 120, 175);

		context.font = "400 14px 'Inter', sans-serif";
		context.textBaseline = "hanging";
		context.fillText("1 ⁄ min × 1000", 350 - 120, 175 + 75);
		context.fillText("km ⁄ h", 350 + 120, 175 + 75);

		context.textAlign = "center";
		context.textBaseline = "alphabetic";
		context.font = "400 14px 'Inter', sans-serif";
		context.fillText(transmission.automatic ? "automatic" : "manual", 350, 175 + 142.5);
	}
}