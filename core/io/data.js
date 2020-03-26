var data = {
	redirect: function () {
		if (localStorage.getItem("lastCar")) {
			var location = localStorage.getItem("lastCar");

			if (location.split('/').length < 4)
				return window.location.replace("?BMW/3-Series/2010/320d");

			brand = location.split('/')[0].replace(/_/g, " ");
			serie = location.split('/')[1];
			year = location.split('/')[2];
			model = year + " " + location.split('/')[3].replace(/_/g, " ");
			
			if (cars[brand] && cars[brand][serie] && cars[brand][serie][model])
				return window.location.replace("?" + location);
		}
		return window.location.replace("?BMW/3-Series/2010/320d");
	}, init: function () {
		if (!window.location.href.includes("?"))
			return data.redirect();
		var location = window.location.href.split('?')[1];

		brand = location.split('/')[0].replace(/_/g, " ");
		serie = location.split('/')[1];
		year = location.split('/')[2];
		model = year + " " + location.split('/')[3].replace(/_/g, " ");
		
		if (cars[brand] && cars[brand][serie] && cars[brand][serie][model])
			car = cars[brand][serie][model];
		else
			return data.redirect();
		
		localStorage.setItem("lastCar", location);

		car = data.parse(car);

		car.general = {};		
		car.general.brand = brand;
		car.general.country = cars[brand].country;
		car.general.year = model.substr(0, 4);
		car.general.model = model.substr(5);
		car.general.name = car.general.brand + " " + car.general.model + " '" + car.general.year.substr(2);
		
		document.title = car.general.name;
		// document.getElementById("title").innerHTML = car.general.name;
		// document.getElementById("rights").innerHTML = "All rights reserved to " + car.general.brand;
	}, parse: function (text) {
		var file = {};

		file.ENGINE = text.split("; ")[0];
		file.TRANSMISSION = text.split("; ")[1];
		file.TIRES = text.split("; ")[2];
		file.DIMENSIONS = text.split("; ")[3];

		file.engine = {};
		file.tires = {};
		file.transmission = {};
		file.dimensions = {};

		file.dimensions.mass = parseFloat(file.DIMENSIONS.split(" ")[0]);
		file.dimensions.cx = parseFloat(file.DIMENSIONS.split(" ")[1]);
		file.dimensions.area = parseFloat(file.DIMENSIONS.split(" ")[2]);

		return file;
	}
};