var ui = {
	init: function () {
		return;
	}, refresh: function () {
		var canvas = document.getElementById('realtime');
		var context = canvas.getContext('2d');
		var cw = canvas.width;
		var ch = canvas.height;

		var w = 450, h = 200, x, y;
		
		context.strokeStyle = "white";
		context.fillStyle = "white";
		context.lineCap = "round";
		context.lineWidth = 3;

		context.clearRect(0, 0, cw, ch);

		if (false) {
			context.strokeRect(0, 0, cw, ch);
			context.strokeRect(cw/2 - w/2, ch/2 - h/2, w, h);
		}

		var bufferLength = sound.FFT.analyser.frequencyBinCount;
		var dataArray = new Float32Array(bufferLength);
		var nyquist = sound.context.sampleRate/2, frequency;

		sound.FFT.analyser.getFloatFrequencyData(dataArray);

		if (sound.context.state == "suspended") {
			context.beginPath();
			context.moveTo(cw/2 - w/2, ch/2 + h/2 - h/2);
			context.lineTo(cw/2 + w/2, ch/2 + h/2 - h/2);
			context.stroke();
		} else for (var i = 0; i < bufferLength; i++) {
			frequency = i / dataArray.length * nyquist;
			context.strokeStyle = Math.abs(frequency - sound.FFT.f[1]*engine.rpm) < 12.5 ? "red" : "white";
			x = (Math.log10(frequency) - Math.log10(20)) / (Math.log10(nyquist) - Math.log10(20)) * w;
			// x = frequency / nyquist * w;
			y = h/2 + ((120 + dataArray[i])/2) / 120 * h;
			context.beginPath();
			context.moveTo(cw/2 - w/2 + x, ch/2 + h/2 - h/2);
			context.lineTo(cw/2 - w/2 + x, ch/2 + h/2 - y);
			context.stroke();
		}

		// alert();

		context.font = "400 10px 'Inter', sans-serif";
		context.textAlign = "left";
		context.textBaseline = "alphabetic";

		for (var a = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000], i = 0; i < a.length; i++) {
			frequency = a[i];
			x = (Math.log10(frequency) - Math.log10(20)) / (Math.log10(nyquist) - Math.log10(20)) * w;
			// x = frequency / nyquist * w;
			context.fillText(frequency >= 1000 ? frequency/1000 + "k" : frequency, cw/2 - w/2 + x, ch/2 + h/2 + 15);
			if (frequency < 170)
				context.fillText(frequency*60, cw/2 - w/2 + x, ch/2 + h/2);
		}

		context.textAlign = "right";
		context.fillText("Hz", cw/2 + w/2, ch/2 + h/2 + 15);
		context.fillText("1 ⁄ min", cw/2 + w/2, ch/2 + h/2);


		var name = "";
		if (transmission.gear == 0)
			name = "N";
		else if (transmission.gear == -1)
			name = "R";
		else if (transmission.automatic)
			name = (transmission.logic > 1 ? "S" : "D") + transmission.gear;
		else
			name = "M" + transmission.gear;

		context.textAlign = "left";
		context.font = "700 16px 'Inter', sans-serif";
		context.fillText(sound.context.state, cw/2 - w/2, ch/2 + h/2 - 15);
		
		context.font = "900 24px 'Inter', sans-serif";
		context.fillText(document.title, cw/2 - w/2, ch/2 - h/2 - 10);
		
		context.textAlign = "left";
		context.font = "900 24px 'Inter', sans-serif";
		context.fillText(name, cw/2 - w/2, ch/2 + h/2 + 50);
		context.textAlign = "right";
		context.fillText(50 * Math.round(engine.rpm / 50), cw/2 + w/2 - 75, ch/2 + h/2 + 50);
		context.fillText((vehicle.speed*3.6).toFixed(), cw/2 + w/2, ch/2 + h/2 + 50);

		context.font = "400 12px 'Inter', sans-serif";
		context.textAlign = "left";
		context.fillText(transmission.automatic ? "automatic" : "manual", cw/2 - w/2, ch/2 + h/2 + 65);
		context.textAlign = "right";
		context.fillText("1 ⁄ min", cw/2 + w/2 - 75, ch/2 + h/2 + 65);
		context.fillText("km ⁄ h", cw/2 + w/2, ch/2 + h/2 + 65);
	}
}