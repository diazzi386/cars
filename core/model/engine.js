var engine = {
	min: 500,
	rpm: 0,
	airflow: 0,
	startup: true,
	injection: 1,
	mu: 0.85,
	interpolateTorque: function (rpm) {
		rpm = rpm || engine.rpm;
		for (var i = 0; i < car.engine.rpm.length - 1; i++) {
			var RPM0 = car.engine.rpm[i];
			var RPM1 = car.engine.rpm[i + 1];

			if (i == 0 && rpm <= RPM0) {
				var T0 = car.engine.T[i];
				var T1 = car.engine.T[i + 1];
				var T = T0 + (T1 - T0) / (RPM1 - RPM0) * (rpm - RPM0);
				return T;
			} else if (rpm >= RPM0 && rpm <= RPM1) {
				var T0 = car.engine.T[i];
				var T1 = car.engine.T[i + 1];
				var T = T0 + (T1 - T0) / (RPM1 - RPM0) * (rpm - RPM0);
				return T;
			} else if (i == car.engine.rpm.length - 2 && rpm > RPM1) {
				var T0 = car.engine.T[i];
				var T1 = car.engine.T[i + 1];
				var T = T0 + (T1 - T0) / (RPM1 - RPM0) * (rpm - RPM0);
				return T;
			}
		}
	}, torque: function () {
		var T = engine.interpolateTorque();
		var x = engine.rpm / car.engine.rpm[car.engine.rpm.length - 1];
		var n = car.engine.rpm[0] / car.engine.rpm[car.engine.rpm.length - 1];
		var l = 0.5;
		var dt = time.dt;

		var Ja = car.engine.fuel == "D" ? 2.0 : 1.0;

		engine.airflow = engine.airflow + Math.sign((engine.startup ? 0.6 : pedals.throttle) - engine.airflow) * dt / Ja;
		engine.airflow = Math.max(0, engine.airflow);
		engine.airflow = Math.min(1, engine.airflow);

		if (x > 1)
			engine.cutoff();
		else if (transmission.gear == 0 && engine.rpm >= transmission.regime('+') && transmission.launch && pedals.brake)
			engine.cutoff();
		
		if (engine.startup && engine.rpm >= 1200)
			engine.startup = false;
		
		t = engine.airflow * engine.injection * (engine.startup ? 0.6 : pedals.throttle);
		
		var b = t * (1 + l) - l / (1 - n) * (x - n);
		return engine.mu * Math.min(b, 1) * T;
	}, power: function () {
		var RPM = engine.rpm;
		var Nm = engine.torque();
		return RPM * Nm / 7025;
	}, cutoff: function () {
		engine.injection = 0;
		window.setTimeout(function () {
			engine.injection = 1;
		}, 90);
	}, dyno: function () {
		var RPM = [],
			T = [],
			P = [],
			l = car.engine.rpm.length;
	
		for (var i = 0; i < l; i++) {
			RPM[i] = car.engine.rpm[i];
			T[i] = car.engine.T[i];
			P[i] = RPM[i] * T[i] / 9554;
		}
	
		return {
			Pmax: P[4],
			Tmax: T[2],
			RPM_Pmax: RPM[4],
			RPM_Tmax: RPM[2],
			RPM: RPM,
			P: P,
			T: T
		};
	}, theoreticalSpeed: function () {
		var v = Math.pow(1000 * engine.dyno().Pmax / (0.5 * 1.2 * car.dimensions.area * car.dimensions.cx), 1/3) * 3.6;
		return 10 * Math.floor(v / 10);
	}, init: function () {
		var str = car.ENGINE;
		var P = parseFloat(str.split(' ')[3]);
		var p = parseFloat(str.split(' ')[4]);
		var N = parseFloat(str.split(' ')[5]);
		var n = parseFloat(str.split(' ')[6]);
		var l = parseFloat(str.split(' ')[7]);
	
		var RPM = [];
		var T = [];
	
		RPM[0] = Math.max(1000 - info.engine.ncyl() * 50, 500);
		RPM[1] = 400 + 0.5*n;
		RPM[2] = n;
		RPM[3] = n < 2950 ? Math.min(p - 500, P*7025/N-500) : 0.4 * n + 0.6 * p;
		RPM[4] = p;
		RPM[5] = l;
	
		for (i = 0; i < 6; i++)
			RPM[i] = 10*Math.floor(RPM[i]/10);
	
		n = RPM[2];
		p = RPM[4];
	
		T[0] = 0.69 * N;
		T[1] = Math.min(0.2*T[0] + 0.8*N, 10 + (T[0] - 10)/RPM[0]*RPM[1]);
		T[2] = N;
		T[3] = n < 2950 ? N : 0.945 * 7025 * P / RPM[3];
		T[4] = 7025 * P / p;
		T[5] = n < 2950 ? 0.85 * 7025 * P / RPM[5] : 0.9 * 7025 * P / RPM[5];
	
		for (i = 0; i < 6; i++) {
			T[i] = Math.min(T[i], N, 7025 * P / RPM[i]);
		}
	
		car.engine.rpm = RPM;
		car.engine.T = T;
		car.engine.Tmax = N;
		car.engine.Pmax = P;

		car.engine.fuel = car.ENGINE.split(' ')[2][1];
		car.engine.alim = car.ENGINE.split(' ')[2][0];

		engine.max = RPM[5];

		car.engine.J = car.engine.Tmax / 100 * 0.10 * (car.engine.fuel == "D" ? 1.3 : 1.0);
	}
};