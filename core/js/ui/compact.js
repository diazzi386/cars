var colors = {
    white: "#FFFFFF",
    black: "#000000",
	red: "#D32F2F",
	red_dark: "#C62828",
    amber: "#FBC02D",
    orange: "#FF9800",
    deeporange: "#E64A19",
};

var ui = {
	data: {
		rpm: {
			limit: 0,
			div: 0
		}, kmh: {
			limit: 0,
			div: 0,
			red: 0
		}
	}, init: function () {
		var canvas = document.getElementById('init');
		var context = canvas.getContext('2d');
		var w = canvas.width;
		var h = canvas.height;

		context.clearRect(0, 0, w, h);

		ui.data.rpm.limit = 1000 * Math.ceil(engine.max/1000);

		context.fillStyle = "rgba(255, 255, 255, 0.2)";

		context.textAlign = "center";
		context.textBaseline = "middle";
		context.font = "900 16px 'Inter', sans-serif";

		for (var i = 0; i <= ui.data.rpm.limit; i += 1000) {
			context.fillText(i/1000, 350 - 100 + 200 * i / ui.data.rpm.limit, 120);
		}

		context.fillStyle = colors.white;

		context.textAlign = "left";
		context.textBaseline = "middle";
		context.font = "900 24px 'Inter', sans-serif";
		context.fillText(document.title, 243, 220);
	}, refresh: function () {
		var canvas = document.getElementById('realtime');
		var context = canvas.getContext('2d');
		var w = canvas.width;
		var h = canvas.height;

		context.clearRect(0, 0, w, h);

		context.fillStyle = colors.white;
		context.strokeStyle = colors.white;

		context.textAlign = "center";
		context.textBaseline = "middle";
		context.font = "900 16px 'Inter', sans-serif";

		for (var i = 0; i <= 1000*Math.round(Math.min(engine.rpm, engine.max)/1000); i += 1000) {
			if (i > engine.max - 1000)
				context.fillStyle = "tomato";
			context.fillText(i/1000, 350 - 100 + 200 * i / ui.data.rpm.limit, 120);
		}

		/*
		context.fillStyle = "tomato";
		context.textAlign = "right";
		context.fillText(50*Math.round(engine.rpm/50), 457, 100);
		*/

		var name = "";
		if (transmission.gear == 0)
			name = "N";
		else if (transmission.gear == -1)
			name = "R";
		else if (transmission.automatic)
			name = (transmission.mode == 1 ? "S" : "D") + transmission.gear;
		else
			name = "M" + transmission.gear;
		

		context.fillStyle = colors.white;
		context.textAlign = "left";
		context.font = "900 50px 'Inter', sans-serif";
		context.fillText(name, 243, 160);
		context.textAlign = "right";
		context.fillText((vehicle.speed*3.6).toFixed(), 457, 160);

		context.font = "400 15px 'Inter', sans-serif";
		context.textAlign = "left";
		context.fillText("1 ⁄ min × 1000", 243, 100);
		context.textAlign = "right";
		context.fillText("km ⁄ h", 457, 190);
		context.textAlign = "left";
		context.fillText(transmission.automatic ? "automatic" : "manual", 243, 190);
	}
}