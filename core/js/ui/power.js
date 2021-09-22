var ui = {
	data: {
		rpm: {
			limit: 0
		}, kmh: {
			limit: 0
		}
	}, init: function () {
		var canvas = document.getElementById('init');
		var context = canvas.getContext('2d');
		var w = canvas.width;
		var h = canvas.height;

		context.clearRect(0, 0, w, h);

		context.fillStyle = "white";
		context.strokeStyle = "white";

		if (ui.data.kmh.limit < 270)
			ui.data.kmh.div = 20;
		else if (ui.data.kmh.limit < 400)
			ui.data.kmh.div = 30;
		else
			ui.data.kmh.div = 50;

		ui.data.kmh.limit = ui.data.kmh.div * Math.ceil(ui.data.kmh.limit / ui.data.kmh.div);
		ui.data.rpm.limit = 1000 * Math.ceil((engine.max + 100)/1000);
	}, refresh: function () {
		var canvas = document.getElementById('realtime');
		var context = canvas.getContext('2d');
		var w = canvas.width;
		var h = canvas.height;

		context.clearRect(0, 0, w, h);

		context.lineWidth = 3;
		context.strokeStyle = "white";
		context.fillStyle = "black";

		var b = 300, h = 50, x, y, p, t;

		context.strokeStyle = "white";
		context.fillStyle = "white";
		context.lineWidth = 250 / ui.data.rpm.limit * b * 0.8;

		for (var i = 0; i < ui.data.rpm.limit; i += 250) {
			x = b * i / ui.data.rpm.limit;
			if (false) {
				p = engine.lookup(i) * i / 7025;
				y = (0.3 + 0.7 * p / engine.data.power.max) * h;
			} else {
				t = engine.lookup(i);
				y = t / engine.data.torque.max * h;
			}
			context.strokeStyle = "rgba(" + (i >= engine.max ? "220, 20, 60, " : "255, 255, 255, ") + (engine.rpm >= i ? "1" : "0.1") + ")";
			context.beginPath();
			context.moveTo(350 - b/2 + x, 175 + h/2);
			context.lineTo(350 - b/2 + x, 175 + h/2 - y);
			context.stroke();
		}
		
		context.font = "700 14px 'Inter', sans-serif";
		context.textAlign = "center";
		context.textBaseline = "hanging";

		for (var i = 1000; i < ui.data.rpm.limit; i += 1000) {
			x = b * i / ui.data.rpm.limit;
			context.fillText(i/1000, 350 - b/2 + x, 175 + h/2 + 8)
		}

		var name = "";
		if (transmission.gear == 0)
			name = "N";
		else if (transmission.gear == -1)
			name = "R";
		else if (transmission.automatic)
			name = (transmission.mode > 1 ? "S" : "D") + transmission.gear;
		else
			name = "M" + transmission.gear;

		context.font = "900 24px 'Inter', sans-serif";
		context.textAlign = "left";
		context.textBaseline = "alphabetic";
		context.fillText(document.title, 350 - b/2, 175 - h - 20);
		
		context.textAlign = "left";
		context.textBaseline = "hanging";
		context.font = "900 48px 'Inter', sans-serif";
		context.fillText(name, 350 - b/2, 175 + h/2 + 30);
		context.textAlign = "right";
		context.fillText((vehicle.speed*3.6).toFixed(), 350 + b/2, 175 + h/2 + 30);

		context.font = "400 14px 'Inter', sans-serif";
		context.textAlign = "left";
		context.textBaseline = "hanging";
		context.fillText(transmission.automatic ? "automatic" : "manual", 350 - b/2, 175 + h/2 + 75);
		context.textAlign = "right";
		context.fillText("km ⁄ h", 350 + b/2, 175 + h/2 + 75);
		context.textAlign = "left";
		context.fillText("1 ⁄ min", 350 - 150, 175 - h/2 - 20);
	}
}