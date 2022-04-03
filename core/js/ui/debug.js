var ui = {
	init: function () {
		return;
	}, refresh: function () {
		var canvas = document.getElementById('realtime');
		var context = canvas.getContext('2d');
		var cw = canvas.width;
		var ch = canvas.height;

		var w = 300, h = 120, x, y;

		context.clearRect(0, 0, cw, ch);
		context.strokeRect(0, 0, cw, ch);
		context.strokeRect(cw/2 - w/2, ch/2 - h/2, w, h);
		
		context.strokeStyle = "white";
		context.fillStyle = "white";
		context.lineCap = "round";
		context.lineWidth = 1;
		context.font = "400 10px 'Inter', sans-serif";
		context.textAlign = "left";
		context.textBaseline = "alphabetic";

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
		context.fillText(document.title, cw/2 - w/2, ch/2 - h/2 - 10);
		
		context.textAlign = "left";
		context.font = "900 24px 'Inter', sans-serif";
		context.fillText(name, cw/2 - w/2, ch/2 + h/2 + 50);
		context.textAlign = "right";
		context.fillText(50 * Math.round(engine.rpm / 50), cw/2 + w/2 - 75, ch/2 + h/2 + 50);
		context.fillText((vehicle.speed*3.6).toFixed(), cw/2 + w/2, ch/2 + h/2 + 50);

		context.font = "400 12px 'Inter', sans-serif";
		context.textAlign = "left";
		context.fillText(transmission.automatic ? "automatic" : "manual", cw/2 - w/2, ch/2 + h/2 + 65);
		context.textAlign = "right";
		context.fillText("1 ⁄ min", cw/2 + w/2 - 75, ch/2 + h/2 + 65);
		context.fillText("km ⁄ h", cw/2 + w/2, ch/2 + h/2 + 65);
	}
}