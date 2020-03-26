var sound = {
	muted: false,
	f_fundamental: 0,
	frequencies: null,
	context: null,
	gen: null,
	osc: null,
	gain: null,
	volume: 0,
	nodes: 0,
	eq: {
		highpass: 0,
		lowpass: 0
	}, FFT: {
		f0: 0,
		v0: 0,
		f: [],
		v: []
	}, init: function () {
		var N = info.engine.ncyl();

        sound.context = new (window.AudioContext || window.webkitAudioContext)();
		sound.osc = new Array(l);
		sound.gain = new Array(l);

		sound.eq.highpass = sound.context.createBiquadFilter();
		sound.eq.highpass.type = 'highpass';
		sound.eq.highpass.frequency.value = 300; // 0
		sound.eq.highpass.Q.value = 0.1;

		sound.eq.lowpass = sound.context.createBiquadFilter();
		sound.eq.lowpass.type = 'lowpass';
		sound.eq.lowpass.frequency.value = 9000; // 12000
		sound.eq.lowpass.Q.value = 0.1;

		sound.FFT.f0 = 1 / 120;
		sound.FFT.v0 = 1.25;
		sound.FFT.f = [];
		sound.FFT.v = [];

		sound.FFT.f = [0.25, 0.5, 1, 2, 3, 4, N/4, N/2];
		sound.FFT.v = [6, 4, 3, 2, 1, 0.2, 0.1, 0.2, 0.1];


		var l = Math.min(sound.FFT.f.length, sound.FFT.v.length);

        for (i = 0; i < l; i++) {
            sound.osc[i] = sound.context.createOscillator();
            sound.osc[i].type = 'triangle'; // 'sine'
            sound.osc[i].frequency.value = 0;
            sound.gain[i] = sound.context.createGain();
            sound.gain[i].gain.value = 0;
            sound.osc[i].connect(sound.gain[i]);
			// sound.gain[i].connect(sound.context.destination);
        	sound.gain[i].connect(sound.eq.highpass);
			sound.osc[i].start();
		}
		
		sound.eq.highpass.connect(sound.eq.lowpass);
		sound.eq.lowpass.connect(sound.context.destination);
    }, refresh: function () {
		if (sound.context.state === 'suspended')
			sound.context.resume();

		var RPM = engine.rpm;
		var r = RPM / car.engine.rpm[5];
		var l = Math.min(sound.FFT.f.length, sound.FFT.v.length);
		for (var i = 0; i < l; i++) {
			sound.osc[i].frequency.value = sound.FFT.f[i] * sound.FFT.f0 * RPM;
			sound.gain[i].gain.value = sound.FFT.v[i] * sound.FFT.v0 * (0.5 + 0.25 * engine.airflow);
		}
	}, mute: function () {
		sound.muted = true;
	}, play: function () {
		sound.muted = false;
	}, toggle: function () {
		sound.muted = !sound.muted;
	}, plot: function () {
		var RPM = engine.rpm;
		var t = "";
		var l = Math.min(sound.FFT.f.length, sound.FFT.v.length);

		for (var i = 0; i < l; i++) {
			t +="<div>";
			t += "<span>" + (sound.FFT.f[i] * sound.FFT.f0 * RPM).toFixed(1) + " Hz</span>";
			t += "<span>" + (20 * Math.log10(sound.FFT.v[i])).toFixed(0) + " dB</span>";
			t += "</div>";
		}
		
		return t;
	}
};