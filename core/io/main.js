var IO = function () {
	data.init();
	commands.init();
	time.init();
	engine.init();
	tires.init();
	transmission.init();
	sound.init();
	ui.init();
};

var RS = function () {
	data.init();
	engine.init();
	tires.init();
	transmission.init();
	ui.init();
}

var loop = function () {
	time.interval();
	transmission.logic();
	physics.iterate();

	sound.refresh();
	ui.refresh();

	requestAnimationFrame(loop);
};

var init = function () {
	IO();
	loop();
};

window.onload = function () {
	document.fonts.load("10px 'Inter'").then(init);
};