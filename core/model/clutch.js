var clutch = {
	clutch: 0,
	target: 0,
	engaged: false,
	press: function () {
		clutch.target = 0;
		clutch.clutch = 0;
		clutch.engaged = false;
	}, release: function () {
		pedals.wait.throttle = false;
		clutch.target = 1;
	}, update: function () {
		if (clutch.engaged)
			return clutch.clutch = 1;

		var dt = time.dt;
		var J = 1.3 - pedals.target.throttle;

		if (transmission.direction.includes("+S")) {
			clutch.clutch = (engine.rpm - 1000)/(car.engine.fuel == "D" ? 1500 : 2500) * pedals.throttle;
			// clutch.target  = 1;
		}
			
		clutch.clutch = clutch.clutch + Math.sign(clutch.target - clutch.clutch) * dt / J;
		
		clutch.clutch = Math.min(clutch.clutch, 1);
		clutch.clutch = Math.max(clutch.clutch, 0);

		return clutch.clutch;
	}
};