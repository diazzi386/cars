var time = {
	last: 0,
	now: 0,
	dt: 0,
	fast: 1,
	max: 0.100,
	interval: function () {
		var dt = 0;
		time.now = new Date().getTime();
		dt = (time.now - time.last) / 1000;
		time.last = time.now;
		dt = Math.min(time.max, dt);
		dt *= time.fast;
		return time.dt = dt;
	}, init: function () {
		time.last = new Date().getTime();
	}, forward: function () {
		if (time.fast == 1)
			time.fast = 2;
		else if (time.fast == 2)
			time.fast = 5;
		else
			time.fast = 1;
	}, chrono: {
		STAMP: 0,
		TIME_0100: 0,
		TIME_0200: 0,
		TIME_400M: 0,
		ABORTED: false,
		start: function () {
			time.chrono.ABORTED = false;
			time.chrono.STAMP = new Date().getTime();
		}, stop: function () {
			return 0.001 * (new Date().getTime() - time.chrono.STAMP);
		}, abort: function () {
			time.chrono.ABORTED = true;
		}
	}
};