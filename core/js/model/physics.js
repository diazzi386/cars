var road = {
	slope: 0,
	bank: 0,
	corner: {
		angle: 0,
		radius: 0
	}
};

var time = {
	last: 0,
	now: 0,
	delta: 0,
	max: 0.100,
	start: 0,
	speed: {
		check: 0,
		times: {}
	}, distance: {
		check: 0,
		start: 0,
		times: {}
	}, interval: function () {
		time.now = new Date().getTime();
		time.delta = (time.now - time.last) / 1000;
		time.last = time.now;
		time.delta = Math.min(time.max, time.delta);
		return time.delta;
	}, init: function () {
		time.last = new Date().getTime();
	}, check: function () {
		if (vehicle.speed == 0)
			time.start == 0;
		if (time.start == 0) {
			if (transmission.gear > 0 && pedals.throttle && !pedals.clutch && !pedals.brake) {
				time.start = new Date().getTime();
				time.speed.check = 20;
				time.distance.check = 100;
				time.distance.start = vehicle.distance;
			} else
				return;
		} else if (pedals.brake) {
			time.start = 0;
			return;
		} else {
			if (vehicle.speed >= time.speed.check/3.6) {
					time.speed.times[time.speed.check] = (new Date().getTime() - time.start)/1000;
					time.speed.check += 20;
			}
			if (vehicle.distance - time.distance.start >= time.distance.check) {
					time.distance.times[time.distance.check] = (new Date().getTime() - time.start)/1000;
					time.distance.check += 100;
			}
		}
	}
};

var physics = {
	loop: function (dt = time.delta) {
		const g = 9.8, rho = 1.29;
		var m = vehicle.geometry.mass + 70,
			a = vehicle.acceleration,
			v = vehicle.speed,
			rpm = engine.rpm.now,
			ww, we,
			fe, fl, fr,
			te = 0, tc = 0,
			phi = road.slope / 180 * Math.PI,
			l = vehicle.geometry.wheelbase,
			lr = vehicle.geometry.center,
			lf = 1 - vehicle.geometry.center,
			r = tires.radius,
			h = 2 * tires.radius,
			f = tires.f,
			mu = tires.mu,
			cd = vehicle.geometry.cd,
			S = vehicle.geometry.area,
			jm = engine.inertia,
			jw = 2 * tires.inertia,
			tau = transmission.tau;

		/*
		Da fare
		Modello di ogni ruota con forze e accelerazioni
		Modello di slip ruota
		Controlli elettronici
		Massa apparente traslante?
		*/

		if (transmission.drive == "R")
			fl = mu * g * (lf + h / l * a / g); // (m + (transmission.gear == 0 ? 0 : jm / Math.pow(r / tau, 2)))
		else if (transmission.drive == "F")
			fl = mu * g * (lr - h / l * a / g);
		else if (transmission.drive == "A")
			fl = mu * g;
		
		fl *= (m + (transmission.gear == 0 ? 0 : jm / Math.pow(r / tau, 2)));

		// fl += 0.5 * rho * S * cl * Math.pow(v, 2);

		fr = 0.5 * rho * S * cd * Math.pow(v, 2);
		fr += f * m * g * Math.cos(phi);
		fr += pedals.brake * m * g * mu;
		fr = Math.sign(v) * Math.abs(fr);
		fr += m * g * Math.sin(phi);

		we = rpm * (2 * Math.PI) / 60;
		ww = v / r;

		var slip = transmission.gear == 0 || we == 0 ? 0 : (1 - ww/we*tau);

		transmission.coupled = Math.abs(slip) >= 0.015 ? false : true;

		// te = transmission.mu * engine.torque() * (0.9 + 0.2 * Math.random());
		te = transmission.mu * engine.lookup();

		// tires.slip = tires.speed - vehicle.speed;

		if (transmission.gear == 0 || pedals.clutch || !transmission.coupled) {
			if (transmission.gear == 0 || pedals.clutch) {
				tl = 0;
				tc = 0;
				fe = 0;
			} else {
				tl = fl * r / Math.abs(tau);
				tc = 1.25 * transmission.mu * transmission.torque() * Math.sign(slip);
		
				tc = tl > 0 ? Math.min(tc, tl) : tc;
				if (pedals.electronics)
					te = tl > 0 ? Math.min(te, 0.9 * tl) : te;
				fe = tc / r * tau;
			}
			
			we += (te - tc) / jm * dt;
			// fe = fe * Math.sign(tires.slip) * Math.min(tires.slip, 1);
			a = (fe - fr) / m;
			v += a * dt;
		} else {
			fe = te / r * tau;
			fe = Math.min(fe, fl);
			// fe = Math.min(fe, fl * Math.sign(tires.slip) * Math.min(Math.abs(tires.slip), 1));
			a = (fe - fr) / m; // (m + (transmission.gear == 0 ? 0 : jm / Math.pow(r / tau, 2)))
			v += a * dt;
			we = v / r * tau;
		}

		// console.log(te.toFixed(1) + " " + tc.toFixed(1));

		engine.rpm.now = Math.max(we * 60 / (2 * Math.PI), 0);
		vehicle.acceleration = a;
		vehicle.speed = (vehicle.speed * v) < 0 ? 0 : v;
		vehicle.distance += vehicle.speed * dt;
	}
};