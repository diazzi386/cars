var DATA = {
	RPM: {
		X: 0, Y: 0,
		Rext: 135, Rint: 110, Rtxt: 95,
		DIV: 125,
		ANGLE_START: 135, ANGLE_DELTA: 270,
		ZERO: 0,
		REDLINE: {
			R: 124, // 117 115
			THICK: 4 // 6
		}
	}, TACHO: {
		X: 0, Y: 0,
		Rext: 135, Rint: 110, Rtxt: 95,
		ANGLE_START: 145, ANGLE_DELTA: 250,
	}, GEAR: {
		X: 0, Y: 24
	}, SPEEDO: {
		X: 0, Y: -10
	}, TICKS: {
		MAIN: 4, SEC: 2,
		Rext: 120, Rmed: 116, Rint: 110
	}, HAND: {
		Rstart: 80, Rend: 120, THICK: 6
	}, LOGO: {
		X: -145, Y: 62.5
	}
};

var COLORS = {
	BG: 'black',
	FG: "white",
	RED: "orangered",
	ORANGE: "orange"
};

var values = {
	rpm: function () {
		return engine.rpm;
	}, maxrpm: function () {
		var d = 1000;
		var e = 500;
		return d * Math.ceil((car.engine.rpm[car.engine.rpm.length - 1] + e) / d);
		//return 9000;
	}, speed: function () {
		return Math.abs(vehicle.speed * 3.6);
	}, maxspeed: function () {
		var v = Math.min(Math.max(car.transmission.speed, car.transmission.limit), engine.theoreticalSpeed());
		return 160;
	}
};

var hand = function (context, x, y, bM, bm, ls, le, teta) {
	context.beginPath();
	context.moveTo(
		x + ls * Math.cos(teta) + bM/2 * Math.cos(teta + Math.PI*0.5),
		y + ls * Math.sin(teta) + bM/2 * Math.sin(teta + Math.PI*0.5),
	);
	context.lineTo(
		x + ls * Math.cos(teta) - bM/2 * Math.cos(teta + Math.PI*0.5),
		y + ls * Math.sin(teta) - bM/2 * Math.sin(teta + Math.PI*0.5),
	);
	context.lineTo(
		x + le * Math.cos(teta) - bm/2 * Math.cos(teta + Math.PI*0.5),
		y + le * Math.sin(teta) - bm/2 * Math.sin(teta + Math.PI*0.5)
	);
	context.lineTo(
		x + le * Math.cos(teta) + bm/2 * Math.cos(teta + Math.PI*0.5),
		y + le * Math.sin(teta) + bm/2 * Math.sin(teta + Math.PI*0.5)
	);
	// context.closePath();
	context.fill();
};

var line = function (context, x, y, ls, le, teta) {
	context.beginPath();
	context.moveTo(
		x + ls * Math.cos(teta),
		y + ls * Math.sin(teta)
	);
	context.lineTo(
		x + le * Math.cos(teta),
		y + le * Math.sin(teta)
	);
	// context.closePath();
	context.stroke();
};

ui.cluster = {
	canvas: undefined,
	context: undefined,
	onetime: function () {
		var canvas = document.getElementById('init');
		var context = canvas.getContext('2d');
		var w = canvas.width;
		var h = canvas.height;

		context.textBaseline = "middle";

		document.body.style.backgroundColor = COLORS.BG;
		document.body.style.color = COLORS.FG;

		context.clearRect(0, 0, w, h);
		
		context.fillStyle = COLORS.BG;

		
		// RPM ----------------------------------------------------------------
		
		var ANGLE_START = DATA.RPM.ANGLE_START;
		var ANGLE_DELTA = DATA.RPM.ANGLE_DELTA;
		var teta = 0;

		var RPM_MAX = values.maxrpm();
		var RPM_TRQ = RPM_MAX - 500;
		var RPM_RED = RPM_TRQ - 500;
	
		context.strokeStyle = COLORS.FG;
		context.lineWidth = DATA.RPM.REDLINE.THICK;

		// Redline

		RPM_RED = car.engine.rpm[5];		

		// Ticks
		
		for (var i = 0; i <= RPM_MAX; i += DATA.RPM.DIV) {
			teta = (ANGLE_START + ANGLE_DELTA * i / RPM_MAX) * Math.PI / 180;;

			context.strokeStyle = COLORS.BG;
			context.lineWidth = (i % 500 == 0 ? DATA.TICKS.MAIN : DATA.TICKS.SEC) + 4;
			line(context, w / 2 + DATA.RPM.X, h / 2 + DATA.RPM.Y, DATA.TICKS.Rext + 2,
				(i % 500 == 0) ? DATA.TICKS.Rint : DATA.TICKS.Rmed, teta);
			
			context.strokeStyle = i >= RPM_RED ? COLORS.RED : COLORS.FG;
			context.lineWidth = (i % 1000 == 0 ? DATA.TICKS.MAIN : DATA.TICKS.SEC);
			line(context, w / 2 + DATA.RPM.X, h / 2 + DATA.RPM.Y, DATA.TICKS.Rext,
				(i % 500 == 0) ? DATA.TICKS.Rint : DATA.TICKS.Rmed, teta);
		}

		// Scale

		context.fillStyle = COLORS.FG;
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.font = "700 20px 'Inter', sans-serif";

		for (var i = 0; i <= RPM_MAX; i += 1000) {
			context.fillStyle = i >= RPM_RED ? COLORS.RED : COLORS.FG;
			teta = (ANGLE_START + ANGLE_DELTA * i/RPM_MAX) * Math.PI / 180;
			context.fillText(
				i/1000,
				w / 2 + DATA.RPM.X + (DATA.RPM.Rtxt) * Math.cos(teta),
				h / 2 + DATA.RPM.Y + (DATA.RPM.Rtxt) * Math.sin(teta) + 2
			);
		}

		context.fillStyle = COLORS.FG;
		context.font = "16px 'Inter', sans-serif";
		context.fillText("1⁄min × 1000", w / 2 + DATA.RPM.X, h / 2 + DATA.RPM.Y + 70);
		context.fillText("km⁄h", w / 2 + DATA.RPM.X, h / 2 + DATA.RPM.Y - 50);		
	}, realtime: function () {
		var canvas = document.getElementById('realtime');
		var context = canvas.getContext('2d');
		var w = canvas.width;
		var h = canvas.height;

		context.clearRect(0, 0, w, h);

		context.fillStyle = COLORS.FG;
		context.textAlign = "center";
		context.textBaseline = "alphabetic";
		context.font = "700 20px 'Inter', sans-serif";
		context.fillText(car.general.name, w / 2, h / 2 + DATA.TACHO.Y + 115);
		context.font = "400 15px 'Inter', sans-serif";
		context.fillText(transmission.automatic ? "automatic" : "manual", w / 2, h / 2 + DATA.TACHO.Y + 130);

		var teta;
		
		// RPM ----------------------------------------------------------------
		
		context.lineWidth = 1;
		context.fillStyle = COLORS.FG;
		context.lineWidth = DATA.HAND.THICK;

		context.fillStyle = COLORS.FG;
		context.fillStyle = "orangered";

		teta = (DATA.RPM.ANGLE_START + DATA.RPM.ANGLE_DELTA * values.rpm() / values.maxrpm()) * Math.PI / 180;
	
		hand(context, w / 2 + DATA.RPM.X, h / 2 + DATA.RPM.Y, DATA.HAND.THICK + 1, DATA.HAND.THICK - 1.5, DATA.HAND.Rstart, DATA.HAND.Rend, teta);

		// TACHOMETER ---------------------------------------------------------		

		teta = (DATA.TACHO.ANGLE_START + DATA.TACHO.ANGLE_DELTA * values.speed() / values.maxspeed()) * Math.PI / 180;;
		
		// hand(context, w / 2 + DATA.TACHO.X, h / 2 + DATA.TACHO.Y, DATA.HAND.THICK + 1, DATA.HAND.THICK - 1.5, DATA.HAND.Rstart, DATA.HAND.Rend, teta);

		
		context.font = "700 48px 'Inter', sans-serif";
		context.textAlign = "center";
		context.fillStyle = COLORS.FG;	
		context.fillText((3.6 * vehicle.speed).toFixed(), w / 2 + DATA.GEAR.X, h / 2 + DATA.GEAR.Y - 20);	

		context.font = "900 32px 'Inter', sans-serif";
		context.textAlign = "center";
		context.fillStyle = COLORS.FG;
		if (engine.rpm > engine.max - 500 && engine.injection)
			context.fillStyle = COLORS.RED;
		// else if (engine.rpm > engine.max - 2000 && engine.injection)
		//	context.fillStyle = COLORS.ORANGE;
		else if (transmission.launch && engine.rpm > transmission.regime('+'))
			context.fillStyle = COLORS.RED;

		// GEARS
		if (transmission.gear == -1)
			letter = "R";
		else if (transmission.gear == 0)
			letter = "N";
		else if (transmission.automatic) {
			if (pedals.target.throttle > 0.8 || pedals.target.brake > 0.8)
				letter = "S" + transmission.name();
			else
				letter = "D" + transmission.name();
		} else if (!transmission.automatic)
			letter = "M" + transmission.name();

		context.fillText(letter, w / 2 + DATA.GEAR.X, h / 2 + DATA.GEAR.Y + 20);			
	}, night: function () {
		ui.cluster.NIGHT = !ui.cluster.NIGHT;
		ui.cluster.onetime();
		ui.favicon();
	}
};