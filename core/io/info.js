var info = {
	engine: {
		info: function (d) {
			return {
				configuration: info.engine.conf(d),
				cylinders:  info.engine.ncyl(d),
			};
		}, ncyl: function (d) {
			if (d == undefined) d = (car.ENGINE.split(" "))[1];
			return parseInt(d.replace(/[^0-9]/g, ''));
		}, conf: function (d) {
			if (d == undefined) d = (car.ENGINE.split(" "))[1];
			return d.replace(/[^A-Z]/g, '');
		}, arch: function (d) {
			return (car.ENGINE.split(" "))[1];
		}, displacement: function (m) {
			if (m == 't')
				return parseFloat((car.ENGINE.split(" "))[0]/1000).toFixed(1) + " L ("
				+ (car.ENGINE.split(" "))[0] + " cm<sup>3</sup>)";
			else if (m == 'c')
				return parseInt((car.ENGINE.split(" "))[0]);
			else
				return parseFloat((car.ENGINE.split(" "))[0]/1000).toFixed(1);
		}, fuel: function () {
			var FUEL = {
				'?': '?',
				'G': 'Gasoline',
				'D': 'Diesel',
				'l': 'LPG',
				'm': 'Methane',
				'e': 'Ethanol',
				'H': 'Hybrid',
				'E': 'Electric'
			};
			return (FUEL[car.ENGINE.split(" ")[2].substr(-1)] || FUEL['?'])
		}, alim: function () {
			var ALIM = {
				'?': '?',
				'N': 'Naturally aspirated',
				'S': 'Supercharged',
				'T': 'Turbocharged',
				'TT': 'Twin-turbo'
			};
			return (ALIM[car.ENGINE.split(" ")[2].slice(0, -1)] || ALIM['?'])
		}, Pmax: function () {
			return engine.dyno().Pmax.toFixed(0) + " kW (" + (engine.dyno().Pmax * 1.359).toFixed(0)
				+" HP) / " + engine.dyno().RPM_Pmax.toFixed(0) + " RPM";
		}, Tmax: function () {
			return engine.dyno().Tmax.toFixed(0) + " Nm / " + (engine.dyno().RPM_Tmax.toFixed ? engine.dyno().RPM_Tmax.toFixed(0) : engine.dyno().RPM_Tmax) + " RPM";
		}
	}, tires: {
		deno: function (axle) {
			if (axle == 'F')
				return car.tires.front;
			else if (axle == 'R')
				return car.tires.rear;
		}, calc: function (d) {
			var W = 0, Ar = 0, R = 0, D = 0, FW = {}, RW = {};

			if (d == undefined)
				d = car.transmission.traction == 'FWD' ? info.tires.deno('F') : info.tires.deno('R');
			else
				d = d;
			
			W = d.split('/')[0];
			Ar = d.split('/')[1].split('R')[0].replace(/[^0-9.]/g, '');
			R = d.split('R')[1];
			D = 2 * W * Ar / 100 + R * 25.4;

			return {
				denomination: d,
				W: W,
				Ar: Ar,
				R: R,
				D: D
			};
		}, speedrating: function (axle) {
			axle = axle ? axle : (car.transmission.traction == 'FWD' ? 'front' : 'rear');
			if (!car.tires[axle]) return;
			var sr = car.tires[axle];
			sr = sr.split('/')[1].split('R')[0].replace(/[0-9]/g, '').replace(/\s/g, '');
			if (sr == 'H') return 210;
			else if (sr == 'V') return 240;
			else if (sr == 'Z') return "over 240";
			else if (sr == 'W') return 270;
			else if (sr == 'Y') return 300;
			else return 180;
		}
	}, transmission: {
		traction: function () {
			return car.transmission.traction;
		}, ratios: function () {
			var ratios = '';
			ratios += "(" + car.transmission.final.toFixed(2) + ") ";
			for (var i = 0; i < car.transmission.gears.length; i++)
				ratios += car.transmission.gears[i].toFixed(2) + (i == car.transmission.gears.length - 1? "" : " - ");
			return ratios;
		}, driveratio: function () {
			return car.transmission.final.toFixed(2);
		}, reverseratio: function () {
			return (-1 * car.transmission.final).toFixed(2);
		}, ratio: function (g) {
			if (g < 0) return car.transmission.reverse.toFixed(2);
			else if (g == 0) return car.transmission.final.toFixed(2);
			else if (g > 0 && g < car.transmission.gears.length) return car.transmission.gears[g - 1].toFixed(2);
		}, name: function (g) {
			if (g == -1) return "Reverse";
			if (g == 0) return "Axle";
			else if (g == 1) return g + "st";
			else if (g == 2) return g + "nd";
			else if (g == 3) return g + "rd";
			else if (g >= 4) return g + "th";
		}, type: function () {
			var TRANS = {
				'A': 'Automatic',
				'D': 'Dual clutch',
				'M': 'Manual',
				'S': 'Sequential'
			};
			return TRANS[car.TRANSMISSION.split(" ")[1]] + ' ' + (car.transmission.gears.length) + "-speed ";
		}
	}
};