var tires = {
    rpm: 0,
    speed: 0,
    mu: 1.0,
    radius: 0,
    f: 0.015
}

var vehicle = {
	distance: 0,
	speed: 0,
	acceleration: 0,
	geometry: {
		wheelbase: 0,
        center: 0,
        area: 0,
        Cd: 0,
        Cl: 0
	}
};

var road = {
	slope: 0
};

var time = {
	last: 0,
	now: 0,
	delta: 0,
	max: 0.100,
	timer: {
		start: 0,
		check: [0, 0, 0],
		times: [0, 0, 0]
	}, interval: function () {
		time.now = new Date().getTime();
		time.delta = (time.now - time.last) / 1000;
		time.last = time.now;
		time.delta = Math.min(time.max, time.delta);
		return time.delta;
	}, init: function () {
		time.last = new Date().getTime();
	}, check: function () {
		if (time.timer.start == 0) {
			if (transmission.gear > 0 && pedals.throttle && !pedals.clutch && !pedals.brake && vehicle.speed == 0) {
				time.timer.start = new Date().getTime();
				time.timer.check = [1, 1, 1];
				log.print("Timer started...", false);
			} else
				return;
		} else if (time.timer.start != 0) {
			if (pedals.brake) {
				time.timer.start = 0;
				log.print("Timer stopped.", false);
				return;
			} else {
				for (var i = 100, j = 0; i <= 300; i += 100, j += 1) {
					if (vehicle.speed >= i/3.6 && time.timer.check[j] == 1) {
						time.timer.times[j] = (new Date().getTime() - time.timer.start)/1000;
						log.print("0-" + i + ": " + time.timer.times[j].toFixed(1) + " s");
						time.timer.check[j] = 0;
					}
				}
			}
		}
	}
};

var physics = {
    loop: function () {
        var m = vehicle.geometry.mass + 70,
            m_at = 0,
            g = 9.8,
            a = vehicle.acceleration,
            v = vehicle.speed,
            rpm = engine.rpm,
            Wr, Wm, Wd,
            phi = road.slope / 180 * Math.PI,
			l = vehicle.geometry.wheelbase,
			l_1 = vehicle.geometry.center,
			l_2 = 1 - vehicle.geometry.center,
            r =  tires.radius,
			h = 2 * tires.radius,
            f = tires.f,
            mu = tires.mu,
            d = 1.29,
            Cd = vehicle.geometry.cd,
            Cl = vehicle.geometry.cl,
            S = vehicle.geometry.area,
            Jm = engine.inertia,
            Jw = 4 * 1.0,
            tau = transmission.tau,
            dt = time.delta;

        Wm = rpm * 6.28 / 60;
        Wr = v / r;
        Wd = Wm == 0 || tau == 0 ? 0 : Wr / Wm / tau;

        if (transmission.gear != 0 && Wm == 0 && Wr == 0)
            Wd = 1;
        
        m_at = m + (tau == 0 || Math.abs(Wd - 1) > 0.025 ? 0 : Jm / Math.pow(tau * r, 2));
    
        if (transmission.data.traction == "RWD")
            Fl = mu * m_at * g * (l_2 + h / l * a / g);
        else if (transmission.data.traction == "FWD")
            Fl = mu * m_at * g * (l_1 - h / l * a / g);
        else if (transmission.data.traction == "AWD")
            Fl = mu * m_at * g;
        else
            Fl = 0;

        Fl -= 0.5 * d * S * Cl * Math.pow(v, 2);

        Fr = 0.5 * d * S * Cd * Math.pow(v, 2)
            + f * m * g * Math.cos(phi)
            + m * g * Math.sin(phi)
            + pedals.brake * m * g * tires.mu;

        Fr = Math.sign(v) * Math.abs(Fr);

        Tm = engine.mu * engine.torque();

        if (transmission.gear == 0 || pedals.clutch) {
            Tf = 0;
            Fm = 0;
            
            Wm += (Tm - 0) / Jm * dt;
            a = (0 - Fr) / m;
            v += a * dt;
        } else {
            if (transmission.data.limit > 0) {
                if (v >= transmission.data.limit / 3.6) {
                    Tm = Math.min(Tm, Fr*r*Math.abs(tau));
                }
            }
            
            if (Math.abs(Wd - 1) < 0.025) {
                Tm = Math.min(Tm, (Fl + Fr)*r*Math.abs(tau));
                if (!transmission.coupled)
                    transmission.coupled = true;
                    // v = Wm * r * tau;
                a = (Tm / tau / r - Fr) / m_at;
                v += a * dt;
                Wr = v / r;
                Wm = Wr / tau;
            } else {
                if ((transmission.gear == 1 && transmission.direction == 1) || (transmission.gear == -1 && transmission.direction == -1)) {
                    Tf = Math.min(1, engine.rpm / engine.min) * engine.lookup() * Math.sign(1 - Wd);
                } else if (transmission.data.desc != "M" && transmission.data.desc != "S" && pedals.throttle && transmission.direction == 1) {
                    Tf = 1.0 * engine.lookup() * Math.sign(1 - Wd);
                    if (transmission.data.gears.length >= 8 && transmission.data.desc == "A")
                        Tm *= 1 - 0.5 * Math.pow(engine.rpm / engine.max, 2);
                    else if (transmission.data.desc == "D")
                        Tm *= 1 - 1 * Math.pow(engine.rpm / engine.max, 2);
                } else {
                    Tf = 0.5 * engine.rpm / engine.max * engine.lookup() * Math.sign(1 - Wd);
                    Tm *= 0;
                }

                Tf = Math.min(Tf, (Fl + Fr)*r*Math.abs(tau));

                if (transmission.mode < 1)
                    Tm = Math.min(Tm, (0.8 + 0.2 * Math.random()) * Math.abs(Tf));
                else
                    Tm = Math.min(Tm, (1 + 1 * Math.random()) * Math.abs(Tf));
                
                Wm += (Tm - Tf) / Jm * dt;
                a = (Tf / tau / r - Fr) / m;
                v += a * dt;
            }
        }

        engine.rpm = Math.max(Wm * 60 / 6.28, 0);
        vehicle.acceleration = a;
        vehicle.speed = (vehicle.speed * v) < 0 ? 0 : v;
        vehicle.distance += v * dt;

        // log.print((vehicle.acceleration/g).toFixed(2));
    }
};