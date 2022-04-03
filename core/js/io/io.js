var io = {
    version: "0.6.20", // α, β
    compiled: "April 03, 2022", // α, β
    load: async function () {
        console.log(" _____ _____ _____ _____ ");
        console.log("|     |  _  | __  |   __|");
        console.log("|   --|     |    -|__   |");
        console.log("|_____|__|__|__|__|_____|");
		console.log("(cars)");
		console.log("A minimal automotive simulator by @luca.diazzi");
		console.log("Version " + io.version);
        console.log("(C) 2020-" + new Date().getFullYear());
        console.log("-");
        await document.fonts.load("12px 'Inter'");
        data.load();
    }, init: function () {
        data.parse();
        console.log("-");
        console.log("Starting I/O...");
        keyboard.init();
       touch.init();
		menu.init();
        ui.init();
        sound.init();
        time.init();
        console.log("Ready!");
        io.loop();
    }, loop: function () {
		time.interval();
		transmission.check();
		time.check();
        physics.loop();
        sound.refresh();
        ui.refresh();
        requestAnimationFrame(io.loop);
    }
};

var keyboard = {
	init: function () {      
		document.body.addEventListener('keyup', function (event) {
			event.preventDefault ? event.preventDefault() : false;
			keyboard.choose(event.key, true);
		}, false);
		document.body.addEventListener('keydown', function (event) {
			event.preventDefault ? event.preventDefault() : false;
			if (event.repeat == true) return;
			keyboard.choose(event.key, false);
		}, false);
	}, choose: function (key, up) {
        if (up == true) {
            if (key == "q")
                pedals.clutch = 0;
            else if (key == "a")
                pedals.brake = 0;
            else if (key == "s")
                pedals.throttle = 0;
			else if (key == "'")
                data.redirect(true);
            else if (key == "ArrowUp")
                transmission.logic = Math.min(2, transmission.logic + 1);
            else if (key == "ArrowDown")
                transmission.logic =  Math.max(0, transmission.logic - 1);
        } else {
            if (key == "q")
                pedals.clutch = 1;
            else if (key == "a")
                pedals.brake = 1;
            else if (key == "s")
                pedals.throttle = 1;
			else if (key == "f")
                pedals.throttle = 1;
            // else if (key == "l")
            //    transmission.launch = pedals.brake && !transmission.launch && transmission.logic == 2 && transmission.gear == 0;
            else if (key == "t")
				transmission.turn();
            else if (key == "Enter")
                transmission.up();
            else if (key == "Backspace")
                transmission.down();
			else if (key == "c")
				menu.display('cars');
			else if (key == "d")
				menu.display('data');
            else if (key == "h")
                menu.display('help');
            else if (key == "l")
                menu.display('log');
        }
    }
};

var touch = {
    init: function () {
		document.addEventListener('pointerdown', touch.start);
		document.addEventListener('pointermove', touch.move);
		document.addEventListener('pointerup', touch.end);
    }, start: function (event) {
		if (menu.show.cars || menu.show.help || menu.show.help)
			return;
        var x = event.pageX / document.body.offsetWidth,
            y = 1 - event.pageY / document.body.offsetHeight;
        if (x < 0.5)
            pedals.brake = y;
        else if (x >= 0.5)
            pedals.throttle = y;
    }, move: function (event) {
		if (menu.show.cars || menu.show.help || menu.show.help)
			return;
        if (event.buttons == 0)
            return;
        var x = event.pageX / document.body.offsetWidth,
            y = 1 - event.pageY / document.body.offsetHeight;
        if (x < 0.5 && pedals.brake)
            pedals.brake = y;
        else if (x >= 0.5 && pedals.throttle)
            pedals.throttle = y;
    }, end: function (event) {
		if (menu.show.cars || menu.show.help || menu.show.help)
			return menu.display();
        var x = event.pageX / document.body.offsetWidth;
		if (pedals.brake && x < 0.5)
            pedals.brake = 0;
		else if (pedals.throttle && x >= 0.5)
            pedals.throttle = 0;
    }
};

var pedals = {
    clutch: 0,
	brake: 0,
	throttle: 0
};

var sound = {
	context: null,
	osc: [],
    gain: [],
    eq: {},
    FFT: {},
    init: function () {
        sound.context = new (window.AudioContext || window.webkitAudioContext)();        
		sound.eq.bandpass = sound.context.createBiquadFilter();
		sound.eq.bandpass.type = 'bandpass';
        sound.eq.bandpass.Q.value = 0.1;

		sound.eq.highpass = sound.context.createBiquadFilter();
		sound.eq.highpass.type = 'highpass';
		sound.eq.highpass.frequency.value = 60;
        sound.eq.highpass.Q.value = 0.1;

		sound.eq.lowpass = sound.context.createBiquadFilter();
		sound.eq.lowpass.type = 'lowpass';
		sound.eq.lowpass.frequency.value = 360;
        sound.eq.lowpass.Q.value = 1;

		sound.FFT.analyser = sound.context.createAnalyser();
		sound.FFT.f = [1/120, 1/60, engine.cylinders/120, 2*engine.cylinders/120];
		sound.FFT.v = [1.5, 1.25, 1, 0.75];

        for (i = 0; i < sound.FFT.f.length; i++) {
            sound.osc[i] = sound.context.createOscillator();
            sound.osc[i].type = 'sine';
            sound.gain[i] = sound.context.createGain();
            sound.gain[i].gain.value = 0;
            sound.osc[i].connect(sound.gain[i]);
            sound.gain[i].connect(sound.eq.bandpass);
			sound.osc[i].start();
		}
		
		sound.eq.bandpass.connect(sound.eq.lowpass);
		sound.eq.lowpass.connect(sound.eq.highpass);
		sound.eq.highpass.connect(sound.FFT.analyser);
		sound.eq.highpass.connect(sound.context.destination);
    }, refresh: function () {
		for (i = 0; i < sound.FFT.f.length; i++) {
            sound.osc[i].frequency.value = sound.FFT.f[i] * engine.rpm;
            sound.gain[i].gain.setValueAtTime(sound.FFT.v[i] * (1 + pedals.throttle * engine.rpm / engine.max), sound.context.currentTime);
        }

		sound.eq.bandpass.frequency.value = engine.rpm / 120;
        
        if (sound.context.state === 'suspended')
            sound.context.resume();
	}
};

window.onload = io.load;