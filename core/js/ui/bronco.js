ui.rpm = {
		limit: 0,
		div: 0
};

ui.kmh = {
		limit: 0,
		div: 0
};

ui.parameters = {
		w: 560,
		h: 250,
		r: 120
};

const CANVAS_WIDTH = 560,
	CANVAS_HEIGHT = 255;

ui.refresh = function () {
	var cw = ui.canvas.width,
		ch = ui.canvas.height,
		w = ui.parameters.w,
		h = ui.parameters.h,
		r = ui.parameters.r;

	ui.rpm.limit = 1000 * Math.ceil((engine.rpm.max + 500)/1000);
	ui.kmh.limit = vehicle.maxSpeed;
	ui.kmh.limit = Math.min(Math.max(220, ui.kmh.limit), 330);
	ui.kmh.div = ui.kmh.limit <= 240 ? 20 : 30;
	ui.kmh.limit = ui.kmh.div * Math.ceil(ui.kmh.limit / ui.kmh.div);
	
	ui.context.strokeStyle = "white";
	ui.context.fillStyle = "white";
	ui.context.lineCap = "butt";
	ui.context.lineWidth = 3;

	if (false) {
		ui.context.strokeRect(0, 0, cw, ch);
		ui.context.strokeRect(cw/2 - w/2, ch/2 - h/2, w, h);
	}

	ui.context.lineWidth = 12;
	ui.context.strokeStyle = "#448AFF";

	ui.context.beginPath();
	ui.context.arc(cw/2 - w/4, ch/2, r, 0.75 * Math.PI, (0.75 + 1.5 * engine.rpm.max/ui.rpm.limit) * Math.PI);
	ui.context.stroke();

	ui.context.beginPath();
	ui.context.arc(cw/2 + w/4, ch/2, r, 0.75 * Math.PI, 2.25 * Math.PI);
	ui.context.stroke();

	ui.context.strokeStyle = "#D32F2F";

	ui.context.beginPath();
	ui.context.arc(cw/2 - w/4, ch/2, r, (0.75 + 1.5 * engine.rpm.max/ui.rpm.limit) * Math.PI, 2.25 * Math.PI);
	ui.context.stroke();

	ui.context.strokeStyle = "rgba(0, 0, 0, 0.2)";

	ui.context.lineWidth = 4;
	ui.context.beginPath();
	ui.context.arc(cw/2 - w/4, ch/2, r - 4, 0.75 * Math.PI, 2.25 * Math.PI);
	ui.context.stroke();

	ui.context.lineWidth = 4;
	ui.context.beginPath();
	ui.context.arc(cw/2 + w/4, ch/2, r - 4, 0.75 * Math.PI, 2.25 * Math.PI);
	ui.context.stroke();

	ui.context.lineWidth = 2;
	ui.context.strokeStyle = "black";

	for (var i = 0; i <= ui.rpm.limit; i += 500) {
		var teta = (0.75 + i / ui.rpm.limit * 1.5) * Math.PI;
		ui.context.lineWidth = i % 1000 == 0 ? 4 : 2;
		ui.context.beginPath();
		ui.context.moveTo(cw/2 - w/4 + (r - 10) * Math.cos(teta), ch/2 + (r - 10) * Math.sin(teta));
		ui.context.lineTo(cw/2 - w/4 + (r + 10) * Math.cos(teta), ch/2 + (r + 10) * Math.sin(teta));
		ui.context.stroke();
	}
		
	var teta = (0.75 + engine.rpm.max / ui.rpm.limit * 1.5) * Math.PI;
	ui.context.lineWidth = 2;
	ui.context.beginPath();
	ui.context.moveTo(cw/2 - w/4 + (r - 10) * Math.cos(teta), ch/2 + (r - 10) * Math.sin(teta));
	ui.context.lineTo(cw/2 - w/4 + (r + 10) * Math.cos(teta), ch/2 + (r + 10) * Math.sin(teta));
	ui.context.stroke();

	for (var i = 0; i <= ui.kmh.limit; i += 10) {
		var teta = (0.75 + i / ui.kmh.limit * 1.5) * Math.PI;
		ui.context.lineWidth = i % ui.kmh.div == 0 ? 4 : 2;
		ui.context.beginPath();
		ui.context.moveTo(cw/2 + w/4 + (r - 10) * Math.cos(teta), ch/2 + (r - 10) * Math.sin(teta));
		ui.context.lineTo(cw/2 + w/4 + (r + 10) * Math.cos(teta), ch/2 + (r + 10) * Math.sin(teta));
		ui.context.stroke();
	}

	ui.context.textBaseline = "middle";
	ui.context.textAlign = "center";
	ui.context.font = "700 20px 'Inter', sans-serif";
	ui.context.fillStyle = "white";

	for (var i = 0; i <= ui.rpm.limit; i += 1000) {
		var teta = (0.75 + i / ui.rpm.limit * 1.5) * Math.PI;
		ui.context.fillText(i/1000, cw/2 - w/4 + (r - 25) * Math.cos(teta), ch/2 + (r - 25) * Math.sin(teta));
	}

	ui.context.font = "700 15px 'Inter', sans-serif";

	for (var i = 0; i <= ui.kmh.limit; i += ui.kmh.div) {
		var teta = (0.75 + i / ui.kmh.limit * 1.5) * Math.PI;
		ui.context.fillText(i, cw/2 + w/4 + (r - 25) * Math.cos(teta), ch/2 + (r - 25) * Math.sin(teta));
	}

	ui.context.strokeStyle = "white";
	ui.context.fillStyle = "white";
	ui.context.font = "900 25px 'Inter', sans-serif";
	ui.context.textAlign = "center";
	ui.context.textBaseline = "alphabetic";
	ui.context.font = "400 15px 'Inter', sans-serif";
	ui.context.fillText("1 ⁄ min × 1000", cw/2 - w/4, ch/2 + r - 10);
	ui.context.fillText("km ⁄ h", cw/2 + w/4, ch/2 + r - 10);

	document.getElementById("title").innerHTML = document.title;

	/*

	var cw = ui.canvas.width,
		ch = ui.canvas.height,
		w = ui.parameters.w,
		h = ui.parameters.h,
		r = ui.parameters.r;

	ui.context.clearRect(0, 0, cw, ch);

	*/

	var rpm = Math.min(engine.rpm.now, ui.rpm.limit);
	var kmh = Math.min(Math.abs(vehicle.speed * 3.6), ui.kmh.limit);

	ui.context.strokeStyle = "black";
	ui.context.lineWidth = 15;

	var teta = (0.75 + rpm / ui.rpm.limit * 1.5) * Math.PI;
	ui.context.beginPath();
	ui.context.moveTo(cw/2 - w/4 + (r - 45) * Math.cos(teta), ch/2 + (r - 45) * Math.sin(teta));
	ui.context.lineTo(cw/2 - w/4 + (r + 10) * Math.cos(teta), ch/2 + (r + 10) * Math.sin(teta));
	ui.context.stroke();

	var teta = (0.75 + kmh / ui.kmh.limit * 1.5) * Math.PI;
	ui.context.beginPath();
	ui.context.moveTo(cw/2 + w/4 + (r - 45) * Math.cos(teta), ch/2 + (r - 45) * Math.sin(teta));
	ui.context.lineTo(cw/2 + w/4 + (r + 10) * Math.cos(teta), ch/2 + (r + 10) * Math.sin(teta));
	ui.context.stroke();

	ui.context.strokeStyle = "white";
	ui.context.lineWidth = 7.5;

	var teta = (0.75 + rpm / ui.rpm.limit * 1.5) * Math.PI;
	ui.context.beginPath();
	ui.context.moveTo(cw/2 - w/4 + (r - 45) * Math.cos(teta), ch/2 + (r - 45) * Math.sin(teta));
	ui.context.lineTo(cw/2 - w/4 + (r + 5.5) * Math.cos(teta), ch/2 + (r + 5.5) * Math.sin(teta));
	ui.context.stroke();

	var teta = (0.75 + kmh / ui.kmh.limit * 1.5) * Math.PI;
	ui.context.beginPath();
	ui.context.moveTo(cw/2 + w/4 + (r - 45) * Math.cos(teta), ch/2 + (r - 45) * Math.sin(teta));
	ui.context.lineTo(cw/2 + w/4 + (r + 5) * Math.cos(teta), ch/2 + (r + 5) * Math.sin(teta));
	ui.context.stroke();

	ui.context.fillStyle = "white";
	var name = "";
	if (transmission.gear == 0)
		name = "N";
	else if (transmission.gear == -1)
		name = "R";
	else if (transmission.automatic)
		name = (pedals.sport ? "S" : "D") + transmission.gear;
	else
		name = "M" + transmission.gear;

	ui.context.textAlign = "center";
	ui.context.textBaseline = "alphabetic";
	ui.context.font = "700 50px 'Inter', sans-serif";
	ui.context.fillText(name, cw/2 - w/4, ch/2 + 15);
	ui.context.fillText((vehicle.speed*3.6).toFixed(), cw/2 + w/4, ch/2 + 15);
};