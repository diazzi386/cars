var io = {
    version: "0.5.0", // α, β
    load: async function () {
        log.print(" _____ _____ _____ _____ ");
        log.print("|     |  _  | __  |   __|");
        log.print("|   --|     |    -|__   |");
        log.print("|_____|__|__|__|__|_____|");
		log.print("(cars)");
		log.print("A minimal automotive simulator by @luca.diazzi");
		log.print("Version " + io.version);
        log.print("(C) 2020-2021");
        log.print("-");
        await document.fonts.load("12px 'Inter'");
        data.load();
    }, init: function () {
        data.parse();
        log.print("-");
        log.print("Starting I/O...");
        keyboard.init();
        touch.init();
		menu.init();
        ui.init();
        sound.init();
        time.init();
        log.print("Ready!");
        log.print("-");
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

var log = {
	messages: [],
	print: function (text = "", show = true) {
		log.messages.push({
			date: new Date().getTime(),
			message: text,
			show: show
		});

        if (show)
		    console.log(text);
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
                pedals.release(0);
            else if (key == "a")
                pedals.release(1);
            else if (key == "s")
                pedals.release(2);
			else if (key == "'")
                data.redirect(true);
            else if (key == "ArrowUp")
                transmission.set(+1);
            else if (key == "ArrowDown")
                transmission.set(-1);
        } else {
            if (key == "q")
                pedals.push(0);
            else if (key == "a")
                pedals.push(1);
            else if (key == "s")
                pedals.push(2);
			else if (key == "f")
				pedals.push(2);
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
		document.addEventListener('pointerup', touch.end);
		document.addEventListener('pointermove', touch.move);
    }, start: function (event) {
		if (menu.show.cars || menu.show.help || menu.show.help)
			return menu.display();
        var data = touch.xy(event);
        if (data.x < 0.5)
            pedals.push(1);
        else if (data.x >= 0.5)
            pedals.push(2);
    }, end: function (event) {
        var data = touch.xy(event);
		if (data.x < 0.5)
			pedals.release(1);
		else if (data.x >= 0.5)
			pedals.release(2);
    }, move: function (event) {

    }, xy: function (event) {
        var h = document.body.offsetHeight;
		var b = document.body.offsetWidth;
		var x = event.pageX;
		var y = event.pageY;
		var fx, fy;
		
		fx = x / b;
		fy = 1 - y / h;

        return {
			x: fx,
			y: fy
		};
    }
};

var pedals = {
    clutch: 0,
	brake: 0,
	throttle: 0,
	push: function (pedal) {
        switch(pedal) {
            case 0:
                return pedals.clutch = 1;
            case 1:
                return pedals.brake = 1;
            case 2:
                return pedals.throttle = 1;
            default:
                return;
        }
	}, release: function (pedal) {
        switch(pedal) {
            case 0:
                return pedals.clutch = 0;
            case 1:
                return pedals.brake = 0;
            case 2:
                return pedals.throttle = 0;
            default:
                return;
        }
	}
};

var sound = {
	context: null,
	osc: null,
    gain: null,
    eq: {
		highpass: 0,
		lowpass: 0
	}, FFT: {
		f0: 0,
		v0: 0,
		f: [],
		v: []
	}, init: function () {
        var N = engine.data.cylinders;

        sound.context = new (window.AudioContext || window.webkitAudioContext)();
		sound.osc = [];
        sound.gain = [];
        
		sound.eq.highpass = sound.context.createBiquadFilter();
		sound.eq.highpass.type = 'highpass';
		sound.eq.highpass.frequency.value = 60; // 0
		sound.eq.highpass.Q.value = 0.1;

		sound.eq.lowpass = sound.context.createBiquadFilter();
		sound.eq.lowpass.type = 'lowpass';
		sound.eq.lowpass.frequency.value = 6000; // 12000
		sound.eq.lowpass.Q.value = 0.1;

		sound.FFT.f0 = 1 / 120;
		sound.FFT.v0 = 0.5;
		// sound.FFT.f = [0.25, 0.5, 1, 2, 3, 4, N/4, N/2];
		// sound.FFT.v = [1, 1, 1, 1, 0.5, 0.2, 0.1, 0.1, 0.1];
		sound.FFT.f = [0.25, 0.5, 1, 2, 3, 4, N/4, N/2, N];
		sound.FFT.v = [1.5, 1, 0.75, 0.5, 0.2, 0.1, 0.1, 0.05, 0.00];

        for (i = 0; i < sound.FFT.f.length; i++) {
            sound.osc[i] = sound.context.createOscillator();
            sound.osc[i].type = 'triangle'; // 'sine'
            sound.osc[i].frequency.value = 0;
            sound.gain[i] = sound.context.createGain();
            sound.gain[i].gain.value = 0;
            sound.osc[i].connect(sound.gain[i]);
        	sound.gain[i].connect(sound.eq.highpass);
			sound.osc[i].start();
		}
		
		sound.eq.highpass.connect(sound.eq.lowpass);
		sound.eq.lowpass.connect(sound.context.destination);
    }, refresh: function () {
        var x = Math.min(1, engine.rpm / engine.max);
        var N = engine.data.cylinders;
		for (i = 0; i < sound.FFT.f.length; i++) {
            sound.osc[i].frequency.value = sound.FFT.f[i] * sound.FFT.f0 * engine.rpm;
            // For electric cars volume to 0 dB?
			// sound.gain[i].gain.value = sound.FFT.v[i] * sound.FFT.v0 * (1 * pedals.throttle + x);
            sound.gain[i].gain.setTargetAtTime(sound.FFT.v[i] * sound.FFT.v0 * (1 + x + pedals.throttle * x), sound.context.currentTime, 0.015);
        }
		sound.eq.highpass.frequency.value = 120 * (2 - x); // 0
		sound.eq.lowpass.frequency.value = 6000 + (1 + N/2*x); // 12000
        
        if (sound.context.state === 'suspended') {
            sound.context.resume();
        }
	}
};

window.onload = io.load;