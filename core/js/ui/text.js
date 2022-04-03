var COLORS = {
	BG: 'black',
	FG: "white",
	RED: "#D50000",
	ORANGE: "#FFAB00"
};

var DIMENSIONS = {
	WIDTH: 100
};

var FONT = function (px, bd) {
	var font = "Inter";
	var weight = bd ? bd : 900;
	return weight + " " + px + "px '" + font + "', sans-serif";
}

var ui = {
	NIGHT: false,
	init: function () {
		var canvas = document.getElementById('init');
		var context = canvas.getContext('2d');
		var w = canvas.width;
		var h = canvas.height;

		context.clearRect(0, 0, w, h);
		document.body.style.backgroundColor = COLORS.BG;
		document.body.style.color = COLORS.FG;
		context.clearRect(0, 0, w, h);
		//context.strokeStyle = "white";
		//context.strokeRect(0, 0, w, h);
	}, refresh: function () {
		var canvas = document.getElementById('realtime');
		var context = canvas.getContext('2d');
		var w = canvas.width;
		var h = canvas.height;

		context.clearRect(0, 0, w, h);

		context.textAlign = "center";
		context.textBaseline = "alphabetic";
		context.fillStyle = COLORS.FG;
		context.font = FONT(25, 700);
		context.fillText(document.title, w/2, h/2 - 75);
		context.font = FONT(15, 400);
		context.fillText(transmission.automatic ? "automatic" : "manual", w/2, h/2 - 100);
		context.font = FONT(25, 700);
		context.fillText((vehicle.speed * 3.6).toFixed() + " km⁄h", w/2, h/2 + 45);
		context.fillText((50 * Math.round(engine.rpm / 50)).toFixed() + " 1⁄min", w/2, h/2 + 20);
		if (engine.rpm > engine.max - 500 && engine.injection)
			context.fillStyle = COLORS.RED;
		else if (engine.rpm > engine.max - 2000 && engine.injection)
			context.fillStyle = COLORS.ORANGE;
		else if (transmission.launch && engine.rpm >= transmission.tables.up())
			context.fillStyle = COLORS.ORANGE;
		context.font = FONT(80);
		if (transmission.gear == 0) letter = "NEUTRAL";
		else if (transmission.gear == 1) letter = "FIRST";
		else if (transmission.gear == 2) letter = "SECOND";
		else if (transmission.gear == 3) letter = "THIRD";
		else if (transmission.gear == 4) letter = "FOURTH";
		else if (transmission.gear == 5) letter = "FIFTH";
		else if (transmission.gear == 6) letter = "SIXTH";
		else if (transmission.gear == 7) letter = "SEVENTH";
		else if (transmission.gear == 8) letter = "EIGHTH";
		else if (transmission.gear == -1) letter = "REVERSE";
		context.fillText(letter, w/2, h/2 - 7);	
		if (time.speed.times[200]) {
			context.fillStyle = "#3F51B5";
			context.font = FONT(80);
			context.fillText(time.speed.times[200].toFixed(2), w/2, h/2 + 115);	
		} else if (time.speed.times[100]) {
			context.fillStyle = "#F50057";
			context.font = FONT(80);
			context.fillText(time.speed.times[100].toFixed(2), w/2, h/2 + 115);	
		}

		/*
		context.strokeStyle = "white";
		context.lineWidth = 3;
		context.fillStyle = "white";
		context.beginPath();
		context.arc(w/2 - 50, h/2 - 110, 20, 0, 2*Math.PI);
		context.stroke();
		context.beginPath();
		context.arc(w/2, h/2 - 110, 20, 0, 2*Math.PI);
		context.stroke();
		context.beginPath();
		context.arc(w/2 + 50, h/2 - 110, 20, 0, 2*Math.PI);
		context.stroke();
		context.beginPath();
		context.arc(w/2 - 50, h/2 - 110, 15, 0, 2*Math.PI);
		context.fill();
		*/
	}
};