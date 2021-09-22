var engine = {
    mu: 0.8,
	min: 0,
	max: 0,
	rpm: 0,
	inertia: 1,
	injection: 1,
	lookup: function (x = engine.rpm) {
		var T = engine.data.torque.max;
		var xT = engine.data.torque.rpm;
		var P = engine.data.power.max;
		var xP = engine.data.power.rpm;
		var xL = engine.max;

		// return Math.min(7025*P/xP*(2-x/xP), T);
		return Math.min(
			7025*P/xP*(2-x/xP),
			T,
			T*(0.5 + 0.5*Math.pow(x/xT, engine.data.aspiration == "T" ? 2 : 0.5))
		);
	}, torque: function () {
		var m = engine.min / engine.max;
		var x = engine.rpm / engine.max;
		var t = pedals.throttle;

		var f = m + t * (1 - m) - (1 - t) * x;
			f = Math.max(f, -0.5);
			f = Math.min(f, 1);

		if (engine.rpm >= engine.max)
			return -1 * 0.5 * engine.lookup() * (0.9 + 0.2 * Math.random());
		else
			return f * engine.lookup() * (0.9 + 0.2 * Math.random());
	}
};