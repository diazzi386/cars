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
		if (time.start == 0) {
			if (transmission.gear > 0 && pedals.throttle && !pedals.clutch && !pedals.brake && vehicle.speed == 0) {
				time.start = new Date().getTime();
				time.speed.check = 10;
				time.distance.check = 100;
				time.distance.start = vehicle.distance;
				// console.log("Timer started...");
			} else
				return;
		} else if (time.start != 0) {
			if (pedals.brake || !pedals.throttle) {
				time.start = 0;
				// console.log("Timer stopped.");
				return;
			} else {
				if (vehicle.speed >= time.speed.check/3.6) {
                    time.speed.times[time.speed.check] = (new Date().getTime() - time.start)/1000;
				    time.speed.check += 10;
				}
				if (vehicle.distance - time.distance.start >= time.distance.check) {
                    time.distance.times[time.distance.check] = (new Date().getTime() - time.start)/1000;
				    time.distance.check += 100;
				}
			}
		}
	}
};

var physics = {
    version: "0.6.2", // α, β
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
			lr = vehicle.geometry.center,
			lf = 1 - vehicle.geometry.center,
            r =  tires.radius,
			h = 2 * tires.radius,
            f = tires.f,
            mu = tires.mu,
            d = 1.29,
            Cd = vehicle.geometry.cd,
            Cl = vehicle.geometry.cl,
            S = vehicle.geometry.area,
            Jm = engine.inertia,
            tau = transmission.tau,
            dt = time.delta;

        Wm = rpm * 6.28 / 60;
        Wr = v / r;
        Wd = Wm == 0 || tau == 0 ? 0 : Wr / Wm / tau;

        if (transmission.gear != 0 && Wm == 0 && Wr == 0)
            Wd = 1;
        
        m_at = m + (tau == 0 || Math.abs(Wd - 1) > 0.025 ? 0 : Jm / Math.pow(tau * r, 2));
    
        if (transmission.drive == "R")
            Fl = mu * m_at * g * (lf + h / l * a / g);
        else if (transmission.drive == "F")
            Fl = mu * m_at * g * (lr - h / l * a / g);
        else if (transmission.drive == "A")
            Fl = mu * m_at * g;
        else
            Fl = 0;

        Fl -= 0.5 * d * S * Cl * Math.pow(v, 2);

        Fr = 0.5 * d * S * Cd * Math.pow(v, 2)
            + f * m * g * Math.cos(phi)
            + m * g * Math.sin(phi)
            + pedals.brake * m * g * tires.mu;

        Fr = Math.sign(v) * Math.abs(Fr);

        Tm = transmission.mu * engine.mu * engine.torque();

        if (transmission.gear == 0 || pedals.clutch) {
            Tf = 0;
            Fm = 0;
            
            Wm += (Tm - 0) / Jm * dt;
            a = (0 - Fr) / m;
            v += a * dt;
        } else {
            if (transmission.limit > 0) {
                if (v >= transmission.limit / 3.6) {
                    Tm = Math.min(Tm, Fr*r*Math.abs(tau));
                }
            }
            
            if (Math.abs(Wd - 1) < 0.025) {
                Tm = Math.min(Tm, (Fl + Fr)*r*Math.abs(tau));
                if (!transmission.coupled) {
                    transmission.coupled = true;
                    // v = Wm * r * tau;
                }
                a = (Tm / tau / r - Fr) / m_at;
                v += a * dt;
                Wr = v / r;
                Wm = Wr / tau;
            } else {
                if ((transmission.gear == 1 && transmission.direction == 1) || (transmission.gear == -1 && transmission.direction == -1)) {
                    // Tf = Math.min(1, engine.rpm / engine.min) * engine.lookup() * Math.sign(1 - Wd);
                    Tf = Math.min(1, 0.5 + 0.5 * (engine.rpm - engine.min) / engine.min) * engine.lookup() * Math.sign(1 - Wd);
                } else if (transmission.type != "M" && transmission.type != "S" && pedals.throttle && transmission.direction == 1) {
                    Tf = 1.0 * engine.lookup() * Math.sign(1 - Wd);
                    if (transmission.gears.length >= 7)
                        Tm *= 1 - 0.5 * Math.pow(engine.rpm / engine.max, 2);
                } else {
                    Tf = 0.5 * engine.rpm / engine.max * engine.lookup() * Math.sign(1 - Wd);
                    Tm *= 0;
                }

                // Controllo trazione
                Tf = Math.min(Tf, (Fl + Fr)*r*Math.abs(tau));
                Tm = Math.min(Tm, (transmission.logic < 2 ? 0.8 + 0.2 * Math.random() : 1 + 0.5 * Math.random()) * Math.abs(Tf));
                
                Wm += (Tm - Tf) / Jm * dt;
                a = (Tf / tau / r - Fr) / m;
                v += a * dt;
            }
        }

        engine.rpm = Math.max(Wm * 60 / 6.28, 0);
        vehicle.acceleration = a;
        vehicle.speed = (vehicle.speed * v) < 0 ? 0 : v;
        vehicle.distance += v * dt;

        // console.log((vehicle.acceleration/g).toFixed(2));
    }
};