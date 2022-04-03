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
		var cw = canvas.width;
		var ch = canvas.height;

		context.clearRect(0, 0, cw, ch);

		context.lineWidth = 3;
		context.strokeStyle = "white";
		context.fillStyle = "black";

		var b = 300, h = 100, x, y, p, t;
		// context.strokeRect(cw/2 - b/2, ch/2 - h/2, b, h);

		context.strokeStyle = "white";
		context.fillStyle = "white";
		context.lineCap = "round";
		context.lineWidth = 250 / ui.data.rpm.limit * b * 0.8;
		context.font = "700 14px 'Inter', sans-serif";
		context.textAlign = "center";
		context.textBaseline = "hanging";

		for (var i = 0; i < ui.data.rpm.limit; i += 250) {
			x = b * i / ui.data.rpm.limit;
			if (false) {
				p = engine.lookup(i) * i / 7025;
				y = p / engine.power.max * h;
			} else {
				t = engine.lookup(i);
				y = t / engine.torque.max * h;
			}
			context.strokeStyle = "rgba(" + (i >= engine.max ? "220, 20, 60, " : "255, 255, 255, ") + (engine.rpm >= i ? "1" : "0.1") + ")";
			context.beginPath();
			context.moveTo(cw/2 - b/2 + x, ch/2 + h/2 - y);
			context.lineTo(cw/2 - b/2 + x, ch/2 + h/2 - y);
			context.stroke();

			if (i > 0 && i % 1000 == 0)
				context.fillText(i/1000, cw/2 - b/2 + x, ch/2 + h/2 - y + 20)
		}

		var name = "";
		if (transmission.gear == 0)
			name = "N";
		else if (transmission.gear == -1)
			name = "R";
		else if (transmission.automatic)
			name = (transmission.logic > 1 ? "S" : "D") + transmission.gear;
		else
			name = "M" + transmission.gear;

		context.font = "900 24px 'Inter', sans-serif";
		context.textAlign = "left";
		context.textBaseline = "alphabetic";
		context.fillText(document.title, cw/2 - b/2, ch/2 - h - 20);
		
		context.textAlign = "left";
		context.textBaseline = "hanging";
		context.font = "900 48px 'Inter', sans-serif";
		context.fillText(name, cw/2 - b/2, ch/2 + h/2 + 30);
		context.textAlign = "right";
		context.fillText((vehicle.speed*3.6).toFixed(), cw/2 + b/2, ch/2 + h/2 + 30);

		context.font = "400 14px 'Inter', sans-serif";
		context.textAlign = "left";
		context.textBaseline = "hanging";
		context.fillText(transmission.automatic ? "automatic" : "manual", cw/2 - b/2, ch/2 + h/2 + 75);
		context.textAlign = "right";
		context.fillText("km ⁄ h", cw/2 + b/2, ch/2 + h/2 + 75);
		context.textAlign = "left";
		context.fillText("1 ⁄ min", cw/2 - 150, ch/2 - h/2 - 20);
	}
}