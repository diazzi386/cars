var DATA = {
	RPM: {
		X: 150, Y: 0,
		Rext: 135, Rint: 110, Rtxt: 100,
		DIV: 500,
		ANGLE_START: 145, ANGLE_DELTA: 250,
		ZERO: 0,
		REDLINE: {
			R: 122, // 117 115
			THICK: 6 // 6
		}
	}, TACHO: {
		X: -150, Y: 0,
		Rext: 135, Rint: 110, Rtxt: 95,
		ANGLE_START: 145, ANGLE_DELTA: 250,
	}, GEAR: {
		X: 0, Y: 100
	}, SPEEDO: {
		X: 0, Y: -10
	}, TICKS: {
		MAIN: 3, SEC: 2,
		Rext: 125, Rint: 115,
	}, HAND: {
		Rstart: -20, Rend: 105, THICK: 5
	}, LOGO: {
		X: -145, Y: 62.5
	}
};

var COLORS = {
	BG: 'black',
	FG: "#f44336",
	RED: "#f44336",
	ORANGE: "#f44336"
};

var values = {
	rpm: function () {
		return engine.rpm;
	}, maxrpm: function () {
		var d = car.general.year < 2004 ? 1000 : 500;
		var e = car.general.year < 2004 ? 100 : d;
		return Math.max(d + 5000, d * Math.ceil((car.engine.rpm[car.engine.rpm.length - 1] + e) / d));
		//return 9000;
	}, speed: function () {
		return Math.abs(vehicle.speed * 3.6);
	}, maxspeed: function () {
		var v = Math.min(Math.max(car.transmission.speed, car.transmission.limit), engine.theoreticalSpeed());
		if (v < 220 && car.general.year < 2004)
			v = 220;
		else if (v < 240 && car.general.year < 2004)
			v = 240;
		else if (v < 260)
			v = 260;
		else if (v <= 270)
			v = 270;
		else if (v <= 300)
			v = 300;
		else
			v = 330;
		return v;
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

		if (car.general.year < 2004) {
			DATA.TICKS = {
				MAIN: 4, SEC: 2,
				Rext: 125, Rmed: 112, Rint: 112,
			};
			DATA.RPM.REDLINE = {
				R: 120, // 117 115
				THICK: 10 // 6
			};
			DATA.RPM.Rtxt = 100;
			DATA.TACHO.Rtxt = 95;
			DATA.HAND.Rend = 110;
			DATA.HAND.Rstart = -15;
		} else if (car.general.year < 2010) {			
			DATA.TICKS = {
				MAIN: 4, SEC: 2.5,
				Rext: 122, Rmed: car.general.model.includes("M") ? 117 : 114, Rint: 112,
			};
			DATA.RPM.REDLINE = {
				R: 127.5, // 117 115
				THICK: 5 // 6
			};
			DATA.HAND.Rstart = 20;
			DATA.HAND.Rend = 110;
			DATA.HAND.THICK = 5;
		} else {			
			DATA.TICKS = {
				MAIN: 4, SEC: 2.5,
				Rext: 122, Rmed: 115, Rint: 112,
			};
			DATA.RPM.REDLINE = {
				R: 119, // 117 115
				THICK: 6 // 6
			};
			DATA.RPM.Rtxt = 98;
			DATA.HAND.Rstart = -20;
			DATA.HAND.Rend = 108;
			DATA.HAND.THICK = 5;
		}

		context.textBaseline = "middle";

		document.body.style.backgroundColor = COLORS.BG;
		document.body.style.color = COLORS.FG;

		context.clearRect(0, 0, w, h);
		
		context.fillStyle = COLORS.BG;

		// Main
		context.beginPath();
		context.arc(w / 2 + DATA.RPM.X, h / 2 + DATA.RPM.Y,
			DATA.RPM.Rext,
			0 / 180 * Math.PI, 360 / 180 * Math.PI);
		context.fill();

		context.beginPath();
		context.arc(w / 2 + DATA.TACHO.X, h / 2 + DATA.TACHO.Y,
			DATA.TACHO.Rext,
			0 / 180 * Math.PI, 360 / 180 * Math.PI);
		context.fill();

		context.strokeStyle = COLORS.FG;
		context.lineWidth = 2;

		context.beginPath();
		context.arc(w / 2 + DATA.RPM.X, h / 2 + DATA.RPM.Y,
			DATA.RPM.Rext,
			DATA.RPM.ANGLE_START / 180 * Math.PI, (DATA.RPM.ANGLE_START + DATA.RPM.ANGLE_DELTA) / 180 * Math.PI);
		context.stroke();

		context.beginPath();
		context.arc(w / 2 + DATA.TACHO.X, h / 2 + DATA.TACHO.Y,
			DATA.TACHO.Rext,
			DATA.TACHO.ANGLE_START / 180 * Math.PI, (DATA.TACHO.ANGLE_START + DATA.TACHO.ANGLE_DELTA) / 180 * Math.PI);
		context.stroke();

		// Logo
		
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

		if (car.general.year < 2004) {
			if (RPM_MAX == 6000 && car.engine.rpm[5] < 5000)
				RPM_RED = RPM_RED - 500;
			context.strokeStyle = COLORS.RED;
			context.beginPath();
			context.arc(w / 2 + DATA.RPM.X, h / 2 + DATA.RPM.Y,
				DATA.RPM.REDLINE.R,
				(ANGLE_START + (RPM_RED) / RPM_MAX * ANGLE_DELTA) * Math.PI / 180,
				(ANGLE_START + ANGLE_DELTA) * Math.PI / 180
			);
			context.stroke();
			// context.closePath();
			context.strokeStyle = COLORS.BG;
			context.lineWidth = 1.2;
			for (var i = RPM_RED + 100, j = 0; j < 3; j++, i += 50 + 20*j) {
				teta = (ANGLE_START + i / RPM_MAX * ANGLE_DELTA) * Math.PI / 180;
				line(context, w / 2 + DATA.RPM.X, h / 2 + DATA.RPM.Y, DATA.TICKS.Rext + 2, DATA.TICKS.Rext - DATA.RPM.REDLINE.THICK - 2, teta);
			}
		} else {
			//if (car.general.model.includes("d"))
				RPM_TRQ = car.engine.rpm[5];
			//else
			//	RPM_TRQ = 500*Math.ceil(car.engine.rpm[5]/500);
			var RPM_RED = RPM_TRQ - 500;
			if (!car.general.model.includes("M"))
				RPM_RED = 500*Math.ceil(RPM_RED/500);
			context.strokeStyle = COLORS.RED;
			context.beginPath();
			context.arc(w / 2 + DATA.RPM.X, h / 2 + DATA.RPM.Y,
				DATA.RPM.REDLINE.R,
				(ANGLE_START + RPM_TRQ / RPM_MAX * ANGLE_DELTA) * Math.PI / 180,
				(ANGLE_START + ANGLE_DELTA) * Math.PI / 180
			);
			context.stroke();
			// context.closePath();
			if (car.general.model.includes("M")) {
				context.strokeStyle = COLORS.ORANGE;
				context.beginPath();
				context.arc(w / 2 + DATA.RPM.X, h / 2 + DATA.RPM.Y,
					DATA.RPM.REDLINE.R,
					(ANGLE_START + RPM_RED / RPM_MAX * ANGLE_DELTA) * Math.PI / 180,
					(ANGLE_START + (RPM_TRQ - 50) / RPM_MAX * ANGLE_DELTA) * Math.PI / 180
				);
				context.stroke();
				// context.closePath();
			} else {
				context.lineWidth = 1;
				context.strokeStyle = COLORS.FG;
				for (var i = RPM_RED; i < RPM_TRQ; i += 50) {
					teta = (ANGLE_START / 180 + ANGLE_DELTA / 180 * i / RPM_MAX) * Math.PI;
					line(context, w / 2 + DATA.RPM.X, h / 2 + DATA.RPM.Y, DATA.RPM.REDLINE.R + DATA.RPM.REDLINE.THICK/2,
						DATA.RPM.REDLINE.R - DATA.RPM.REDLINE.THICK/2, teta);
				}
			}
		}

		// Ticks
		
		for (var i = 0; i <= RPM_MAX; i += DATA.RPM.DIV) {
			teta = (ANGLE_START + ANGLE_DELTA * i / RPM_MAX) * Math.PI / 180;;

			context.strokeStyle = COLORS.BG;
			context.lineWidth = (i % 1000 == 0 ? DATA.TICKS.MAIN : DATA.TICKS.SEC) + 4;
			line(context, w / 2 + DATA.RPM.X, h / 2 + DATA.RPM.Y, DATA.TICKS.Rext + 2,
				(i % 1000 == 0) ? DATA.TICKS.Rint : DATA.TICKS.Rmed, teta);
			
			context.strokeStyle = COLORS.FG;
			context.lineWidth = (i % 1000 == 0 ? DATA.TICKS.MAIN : DATA.TICKS.SEC);
			line(context, w / 2 + DATA.RPM.X, h / 2 + DATA.RPM.Y, DATA.TICKS.Rext,
				(i % 1000 == 0) ? DATA.TICKS.Rint : DATA.TICKS.Rmed, teta);
		}

		// Scale

		context.fillStyle = COLORS.FG;
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.font = "700 20px 'Inter', sans-serif";

		for (var i = 0; i <= RPM_MAX; i += 1000) {
			teta = (ANGLE_START + ANGLE_DELTA * i/RPM_MAX) * Math.PI / 180;
			context.fillText(
				i/1000,
				w / 2 + DATA.RPM.X + (DATA.RPM.Rtxt) * Math.cos(teta),
				h / 2 + DATA.RPM.Y + (DATA.RPM.Rtxt) * Math.sin(teta) + 2
			);
		}

		// TACHOMETER ---------------------------------------------------------

		var TOP_SPEED = values.maxspeed();
		var TACHO_DIV = TOP_SPEED > 260 ? 30 : 20;

		context.font = "700 16px 'Inter', sans-serif";
		if (TOP_SPEED > 260 && car.general.year < 2004)
			DATA.TACHO.Rtxt += 1;

		// Ticks

		var DIV = 10;
		
		context.strokeStyle = COLORS.FG;
		context.fillStyle = COLORS.FG;

		for (var i = 0; i <= TOP_SPEED; i += DIV) {
			teta = (DATA.TACHO.ANGLE_START + DATA.TACHO.ANGLE_DELTA * i / TOP_SPEED) * Math.PI / 180;
			context.lineWidth = i % TACHO_DIV == 0 ? DATA.TICKS.MAIN : DATA.TICKS.SEC;
			line(context, w / 2 + DATA.TACHO.X, h / 2 + DATA.TACHO.Y, DATA.TICKS.Rext,
				i % TACHO_DIV == 0 ? DATA.TICKS.Rint : DATA.TICKS.Rmed, teta);
		}

		context.textAlign = "center";
		context.textBaseline = "middle";

		for (var i = 0; i <= TOP_SPEED; i += TACHO_DIV) {
			teta = (DATA.TACHO.ANGLE_START + DATA.TACHO.ANGLE_DELTA * i / TOP_SPEED) * Math.PI / 180;
			context.fillText(
				i,
				w / 2 + DATA.TACHO.X + (DATA.TACHO.Rtxt) * Math.cos(teta) - 2,
				h / 2 + DATA.TACHO.Y + (DATA.TACHO.Rtxt) * Math.sin(teta)
			);
		}

		context.font = "16px 'Inter', sans-serif";
		context.fillText("1⁄min × 1000", w / 2 + DATA.RPM.X, h / 2 + DATA.RPM.Y - 55);
		context.fillText("km⁄h", w / 2 + DATA.TACHO.X, h / 2 + DATA.TACHO.Y - 55);		
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
		context.fillText(car.general.name, w / 2, h / 2 + DATA.TACHO.Y + 125);
		context.font = "400 15px 'Inter', sans-serif";
		context.fillText(transmission.automatic ? "automatic" : "manual", w / 2, h / 2 + DATA.TACHO.Y + 140);

		var teta;
		
		// RPM ----------------------------------------------------------------
		
		context.lineWidth = 1;
		context.fillStyle = COLORS.FG;
		context.lineWidth = DATA.HAND.THICK;

		context.fillStyle = COLORS.FG;
		// context.fillStyle = "orangered";

		teta = (DATA.RPM.ANGLE_START + DATA.RPM.ANGLE_DELTA * values.rpm() / values.maxrpm()) * Math.PI / 180;
	
		hand(context, w / 2 + DATA.RPM.X, h / 2 + DATA.RPM.Y, DATA.HAND.THICK + 1, DATA.HAND.THICK - 1.5, DATA.HAND.Rstart, DATA.HAND.Rend, teta);

		// TACHOMETER ---------------------------------------------------------		

		teta = (DATA.TACHO.ANGLE_START + DATA.TACHO.ANGLE_DELTA * values.speed() / values.maxspeed()) * Math.PI / 180;;
		
		hand(context, w / 2 + DATA.TACHO.X, h / 2 + DATA.TACHO.Y, DATA.HAND.THICK + 1, DATA.HAND.THICK - 1.5, DATA.HAND.Rstart, DATA.HAND.Rend, teta);

		context.font = "900 30px 'Inter', sans-serif";
		context.textAlign = "center";
		context.fillStyle = COLORS.FG;

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

		context.fillText(letter, w / 2 + DATA.GEAR.X, h / 2 + DATA.GEAR.Y);			
	}, night: function () {
		ui.cluster.NIGHT = !ui.cluster.NIGHT;
		ui.cluster.onetime();
		ui.favicon();
	}
};