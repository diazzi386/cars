var io = {
	version: "0.7.28", // α, β
	compiled: "October 4, 2022",
	changelog: "Corrections",
	load: function () {
		console.log(" _____ _____ _____ _____ ");
		console.log("|     |  _  | __  |   __|");
		console.log("|   --|     |    -|__   |");
		console.log("|_____|__|__|__|__|_____|");
		console.log("(cars)");
		console.log("A minimal 1D automotive simulator by @luca.diazzi");
		console.log("Version " + io.version);
		console.log("(C) 2020-" + new Date().getFullYear());
		io.init();
	}, init: function () {
		data.search();
		data.parse();
		console.log("Starting I/O...");
		keyboard.init();
		touch.init();
		menu.init();
		ui.init();
		sound.init();
		time.init();
		console.log("Ready!");
		io.loop();
		setInterval(function () {
			time.interval();
			time.check();
			transmission.check();
			physics.loop();
		}, 1000/60);
		setInterval(menu.shop, 100);
	}, loop: function () {
		// console.time();
		sound.refresh();
		ui.common();
		ui.refresh();
		requestAnimationFrame(io.loop);
		// console.timeEnd()
	}
};

var ui = {
	canvas: null,
	context: null,
	init: function () {
		ui.canvas = document.getElementById('real');
		ui.context = ui.canvas.getContext('2d');
		ui.size();
	}, common: function () {
		document.getElementById("transmission").innerHTML = "<u>t</u> " + (transmission.automatic ? "automatic" : "manual");
		document.getElementById("mode").innerHTML = "<u>m</u> " + (pedals.sport ? "sport" + (pedals.electronics ? "" : "+") : "comfort");
		ui.context.clearRect(0, 0, ui.canvas.width, ui.canvas.height);
	}, size: function () {
		ui.canvas.width = CANVAS_WIDTH;
		ui.canvas.height = CANVAS_HEIGHT;
		return;
	}
}

var keyboard = {
	init: function () {      
		document.body.addEventListener('keyup', function (event) {
			if (event.target !== this)
				return;
			event.preventDefault ? event.preventDefault() : false;
			keyboard.choose(event.key, true);
		}, false);
		document.body.addEventListener('keydown', function (event) {
			if (event.target !== this)
				return;
			event.preventDefault ? event.preventDefault() : false;
			if (event.repeat == true)
				return;
			keyboard.choose(event.key, false);
		}, false);
	}, choose: function (key, up) {
		if (up == true) {
			if (key == "q" || key == "Q")
				pedals.clutch = 0;
			else if (key == "a" || key == "A")
				pedals.brake = 0;
			else if (key == "s" || key == "S") {
				pedals.throttle = 0;
			} else if (key == "'")
				data.redirect();
		} else {
			if (key == "q" || key == "Q")
				pedals.clutch = 1;
			else if (key == "a" || key == "A")
				pedals.brake = 1;
			else if (key == "s" || key == "S")
				pedals.throttle = 1;
			else if (key == "f" || key == "F") {
				pedals.throttle = 1;
			} else if (key == "t" || key == "T") {
				transmission.automatic = !transmission.automatic;
				localStorage.setItem("cars/minimal transmission", transmission.automatic);
			} else if (key == "Enter")
				transmission.shift(1);
			else if (key == "Backspace")
				transmission.shift(-1);
			else if (key == "m" || key == "M") {
				pedals.sport = !pedals.sport, pedals.electronics = true;
				localStorage.setItem("cars/minimal sport", pedals.sport);
			} else if (key == "e" || key == "E")
				pedals.electronics = pedals.sport ? !pedals.electronics : true;
			else if (key == "c" || key == "C")
				menu.display('cars');
			else if (key == "d" || key == "D")
				menu.display('data');
			else if (key == "h" || key == "H")
				menu.display('help');
			else if (key == "j" || key == "J")
				menu.display('shop');
			else if (key == "Escape")
				menu.display();
		}
	}
};

var touch = {
	init: function () {
		document.body.addEventListener('pointerdown', touch.start);
		document.body.addEventListener('pointermove', touch.move);
		document.body.addEventListener('pointerup', touch.end);
	}, start: function (event) {
		if (event.target !== this)
			return;
		if (event.buttons != 1)
			return;
		if (menu.show.cars || menu.show.help || menu.show.data)
			return;
		var x = event.pageX / document.body.offsetWidth,
			y = 1 - event.pageY / document.body.offsetHeight;
		if (x < 0.5)
			pedals.brake = y;
		else if (x >= 0.5)
			pedals.throttle = y;
	}, move: function (event) {
		if (event.target !== this)
			return;
		if (event.buttons != 1)
			return;
		if (menu.show.cars || menu.show.help || menu.show.data)
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
		if (event.target !== this)
			return;
		if (menu.show.cars || menu.show.help || menu.show.data)
			return menu.display();
		var x = event.pageX / document.body.offsetWidth;
		if (x < 0.5 && pedals.brake)
			pedals.brake = 0;
		else if (x >= 0.5 && pedals.throttle)
			pedals.throttle = 0;
	}
};

var sound = {
	context: null,
	noise: null,
	oscillators: [],
	gain: [],
	noiseGain: null,
	master: null,
	analyser: null,
	FFT: {},
	init: function () {
		sound.context = new (window.AudioContext || window.webkitAudioContext)();
		sound.master = sound.context.createGain();
		sound.analyser = sound.context.createAnalyser();
		sound.bandpass = sound.context.createBiquadFilter();
		sound.bandpass.type = 'bandpass';

		sound.noise = sound.context.createBufferSource();
		var bufferSize = 2 * sound.context.sampleRate;
    var buffer = sound.context.createBuffer(1, bufferSize, sound.context.sampleRate);
    for (var i = 0; i < bufferSize; i++)
      buffer.getChannelData(0)[i] = 0.5 * (Math.random() * 2 - 1);
    sound.noise.buffer = buffer;
    sound.noise.loop = true;
		sound.noise.start();
		sound.noise.connect(sound.bandpass);

		// sound.FFT.frequencies = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, engine.cylinders/2, engine.cylinders];
		// sound.FFT.volumes = [1.5, 0.6, 1, 0.5, 1, 0.5, 0.8, 0.5, 0.6, 0.4, 0.3, 0.2, 0.1, 0.4, 0.2];
		sound.FFT.frequencies = [1, 2, 3, 4, 5, 6, engine.cylinders/2, engine.cylinders];
		sound.FFT.volumes = [1, 0.5, 0.1, 0, 0, 0, 0.2, 0.1];

		if (sound.FFT.frequencies.length != sound.FFT.volumes.length)
			console.warn("sound.init: FFT frequencies array length different from volumes array length")

		for (i = 0; i < sound.FFT.frequencies.length; i++) {
			sound.oscillators[i] = sound.context.createOscillator();
			sound.oscillators[i].type = 'sine';
			sound.oscillators[i].connect(sound.bandpass);
			sound.oscillators[i].start();
		}

		sound.bandpass.connect(sound.master);
		sound.master.connect(sound.context.destination);
		sound.master.connect(sound.analyser);
	}, refresh: function () {
		for (i = 0; i < sound.FFT.frequencies.length; i++)
			sound.oscillators[i].frequency.value = 1/60 * sound.FFT.frequencies[i] * engine.rpm.now;
		var volume = (1 + 2 * pedals.throttle) * Math.sqrt(engine.rpm.now / engine.rpm.max);
		sound.master.gain.setValueAtTime(0.5 * volume, sound.context.currentTime);
		sound.bandpass.frequency.value = 240;
		sound.bandpass.Q.value = 2 * Math.exp(-1 * pedals.throttle);
		
		if (sound.context.state === 'suspended')
			sound.context.resume();
	}
};

window.onload = io.load;