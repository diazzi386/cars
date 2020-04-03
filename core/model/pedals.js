var pedals = {
	brake: 0,
	throttle: 0,
	inertia: 0.2,
	target: {
		brake: 0,
		throttle: 0
	}, wait: {
		throttle: false
	}, norm: function (a) {
		a = a || 1;
		// return Math.min(1, a / 0.9);
		// return Math.min(1, Math.sqrt(a/0.7))
		return Math.min(1, 1.5 * a * Math.sqrt(a))
	}, push: function (pedal, q) {
		if (pedal == 1) {
			pedals.target.brake = true;
			pedals.target.brake = pedals.norm(q);
		} else if (pedal == 2) {
			pedals.target.throttle =  true;
			pedals.target.throttle = pedals.norm(q);
		}
	}, release: function (pedal) {
		if (pedal == 1) {
			pedals.target.brake = 0;
		} else if (pedal == 2) {
			pedals.target.throttle = 0;
			transmission.launch = false;
		}
	}, update: function () {
		var dt = time.dt;
		var J = pedals.inertia;
		pedals.throttle = pedals.throttle + Math.sign(
			(pedals.wait.throttle ? 0 : pedals.target.throttle)
			 - pedals.throttle) * dt / J;
		pedals.brake = pedals.brake + Math.sign(pedals.target.brake - pedals.brake) * dt / J;
		if (Math.abs(pedals.throttle - pedals.target.throttle) < 0.05)
			pedals.throttle = pedals.target.throttle;
		if (Math.abs(pedals.brake - pedals.target.brake) < 0.05)
			pedals.brake = pedals.target.brake;
		pedals.check();
	}, check: function () {
		pedals.throttle = Math.max(0, pedals.throttle);
		pedals.brake = Math.max(0, pedals.brake);
		pedals.throttle = Math.min(1, pedals.throttle);
		pedals.brake = Math.min(1, pedals.brake);
	}
};