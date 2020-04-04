var data = {
	redirect: function () {
		if (localStorage.getItem(savingName + "-last")) {
			var location = localStorage.getItem(savingName + "-last");

			if (location.split('/').length < 4)
				return window.location.replace("?" + defaultCar);

			brand = location.split('/')[0].replace(/_/g, " ");
			serie = location.split('/')[1].replace(/_/g, " ");
			year = location.split('/')[2];
			model = year + " " + location.split('/')[3].replace(/_/g, " ");
			
			if (cars[brand] && cars[brand][serie] && cars[brand][serie][model])
				return window.location.replace("?" + location);
		}
		return window.location.replace("?" + defaultCar);
	}, init: function () {
		if (!window.location.href.includes("?"))
			return data.redirect();
		var location = window.location.href.split('?')[1];

		brand = location.split('/')[0].replace(/_/g, " ");
		serie = location.split('/')[1].replace(/_/g, " ");
		year = location.split('/')[2];
		model = year + " " + location.split('/')[3].replace(/_/g, " ");
		
		if (cars[brand] && cars[brand][serie] && cars[brand][serie][model])
			car = cars[brand][serie][model];
		else
			return data.redirect();
		
		localStorage.setItem(savingName + "-last", location);

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