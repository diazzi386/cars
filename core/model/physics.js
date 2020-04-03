var physics = {
	iterate: function (simulate) {
		var m = car.dimensions.mass + 70, m_at = 0,
			g = 9.8,
			a = vehicle.acceleration,
			v = vehicle.speed,
			rpm = engine.rpm,
			Wr, Wm, Wd,
			phi = road.slope / 180 * Math.PI,
			// Geometria masse
			l = vehicle.geometry.wheelbase,
			l_1 = vehicle.geometry.center,
			l_2 = 1 - vehicle.geometry.center,
			r =  tires.radius,
			h = 2 * tires.radius,
			// Pneumatici
			f = tires.f(v),
			mu = tires.mu,
			// Aerodinamica
			d = 1.29,
			Cx = car.dimensions.cx,
			S = car.dimensions.area,
			// Forze
			Fz_1 = 0, Fz_2 = 0,
			Jm = car.engine.J,
			tau = 1 / car.transmission.final / transmission.tau(),
			// Tempo
			dt = simulate? 1/30 : time.dt;

		pedals.update();
		clutch.update();
		
		if (vehicle.speed == 0 && transmission.gear != 0)
			time.chrono.start();
		if (!time.chrono.ABORTED) {
			if (pedals.target.brake || !pedals.target.throttle)
				time.chrono.ABORTED = true;
		}
		
		Wm = rpm / 60 * 6.28;
		Wr = v / r / tau;
		Wd = Wm - Wr;

		// Carico verticale sugli pneumatici
		// mancano:
		// - vincolo di non ribaltamento
		// - pendenza
		Fz_1 = 0.5 * m * g * (l_2 - h / l * a / g);
		Fz_2 = 0.5 * m * g * (l_1 + h / l * a / g);

		m_at = (m + (transmission.gear == 0 ? 0 : Jm / Math.pow(tau, 2)));

		if (car.transmission.traction == "RWD")
			Fl = mu * m_at * g * (l_1 + h / l * a / g);
		else if (car.transmission.traction == "AWD")
			Fl = mu * m_at * g;
		else if (car.transmission.traction == "FWD")
			Fl = mu * m_at * g * (l_1 - h / l * a / g);

		// Forze resistenti
		Fr = 0.5 * d * S * Cx * Math.pow(v, 2)
				+ f * m * g * Math.cos(phi)
				+ m * g * Math.sin(phi)
				+ pedals.brake * m * g;

		Fr = Math.sign(v) * Math.abs(Fr);

		Tm = engine.torque();
		
		if (!clutch.engaged) {
			
			Tf = clutch.clutch * car.engine.Tmax * Math.sign(Wd);

			if (car.transmission.desc != "A")
				Tf = Tf * 1.2;
			
			if (transmission.gear != 0) {
				Tf = Math.min(Tf, (Fl + Fr)*r*Math.abs(tau));
				// Tm = Math.min(Tm, 1.2 * (Fl + Fr)*r*tau);
			}

			Fm = Tf / r / tau;
			
			/*

			if (transmission.gear == 0) {
				Tf = 0;
				eff = 0;
				TR = 0;
				Fm = 0;
			} else {
				var SR = Wr / Wm;
				var CF = 0.0009 * (1 - SR * SR * SR);
				var TR = 2 - SR;
				var eff = 0.9 * TR * SR + 0.1;
				Tf = CF * Wm * Wm;
				Fm = eff * TR * Tf / r / tau;
				console.log(SR.toFixed(1) + ", " + CF.toFixed(1) + ", " + Tf.toFixed(1) + " Nm, " );
			}

			*/
			
			am = (Tm - Tf) / Jm;
			Fm = Math.min(Fm, Fl + Fr);
			a = (Fm - Fr) / m;
		} else {
			Fm = Math.min(Tm / r / tau, Fl + Fr);
			a = (Fm - Fr) / (m + Jm / Math.pow(tau, 2));
			am = a / r / tau;
		}

		Wm = Wm + am * dt;
		rpm = Wm * 60 / 6.28;
		v = v + a * dt;

		if (v * tires.speed < 0)
			v = 0;
		Wr = v / r / tau;

		if (!clutch.engaged && clutch.target == 1 && Wd * (Wm - Wr) < 0 /* && Wr * 60 / 6.28 >= car.engine.rpm[0] */) {
			Wm = Wr;
			clutch.engaged = true;
		}

		v = Math.abs(v) < 0.05 ? 0 : v;

		engine.rpm = rpm;
		vehicle.speed = v;
		vehicle.acceleration = a;
		vehicle.distance += v * dt;
		
		if (!time.chrono.ABORTED) {
			if (!time.chrono.TIME_0100 && v > 100/3.6)
				time.chrono.TIME_0100 = time.chrono.stop();
			if (!time.chrono.TIME_0200 && v > 200/3.6)
				time.chrono.TIME_0200 = time.chrono.stop();
			if (!time.chrono.TIME_400M && vehicle.distance > 400)
				time.chrono.TIME_400M = time.chrono.stop();
			if (time.chrono.TIME_0100 && time.chrono.TIME_0200 && time.chrono.TIME_400M)
				time.chrono.abort();
		}
	}
};

var vehicle = {
	distance: 0,
	speed: 0,
	acceleration: 0,
	geometry: {
		wheelbase: 2.600,
		center: 0
	}
};

var road = {
	slope: 0
};

var COMPILED = {
	DATE: "Apr. 3, 2020",
	VER: "0.3.35",
	CHANGELOG: "Tires, transmissions, clusters, cars"
}