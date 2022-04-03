const cars = {
	"Ford": {
		country: "US",
		"Fiesta": {
			"2014 Fiesta 1.2 (85)": "1.2 L4 NG 85 5800 115 4200 800 6500; F M 4.06 3.58 1.93 1.28 0.95 0.76 -3.62; 195/55R16 1; 970 0.6 2.50 2.15 0.33",
			"2014 Fiesta 1.0 EcoBoost (100)": "1.0 L3 TG 100 6000 170 1400 800 6500; F M 3.61 3.58 1.93 1.21 0.88 0.69 -3.62; 195/55R16 1; 1020 0.6 2.50 2.15 0.33",
			"2014 Fiesta 1.0 EcoBoost (125)": "1.0 L3 TG 125 6000 170 1400 800 6500; F M 3.61 3.58 1.93 1.21 0.88 0.69 -3.62; 195/55R16 1; 1020 0.6 2.50 2.15 0.33",
			"2014 Fiesta 1.0 EcoBoost (140)": "1.0 L3 TG 140 6000 180 1400 800 6500; F M 3.61 3.58 1.93 1.21 0.88 0.69 -3.62; 205/40R17 1; 1050 0.6 2.50 2.15 0.33",
			"2014 Fiesta 1.5 TDCi (75)": "1.5 L4 TD 75 3750 185 1750 800 5000; F M 3.37 3.58 1.93 1.21 0.88 0.69 -3.62; 195/55R16 1; 1035 0.6 2.50 2.15 0.33",
			"2014 Fiesta 1.5 TDCi (95)": "1.5 L4 TD 95 3750 200 1750 800 5000; F M 3.37 3.58 1.93 1.21 0.88 0.69 -3.62; 195/55R16 1; 1035 0.6 2.50 2.15 0.33",
			"2014 Fiesta ST (180)": "1.6 L4 TG 180 5700 240 1600 800 6500; F M 3.82 3.73 2.05 1.36 1.03 0.82 0.69 -3.82; 205/40R17 1; 1090 0.6 2.50 2.10 0.33",
			"2016 Fiesta ST (200)": "1.6 L4 TG 200 5700 290 2000 800 6500; F M 4.06 3.73 2.05 1.36 1.03 0.82 0.69 -3.82; 205/40R17 1; 1100 0.6 2.50 2.10 0.33",
			"2018 Fiesta 1.5 TDCi (85)": "1.5 L4 TD 85 3750 215 1750 800 5000; F M 3.37 3.42 1.88 1.17 0.87 0.68 0.57 -3.83; 195/60R15 1; 1165 0.6 2.5 2.15 0.30",
			"2018 Fiesta 1.1 (85)": "1.1 L4 NG 85 6300 110 3500 800 6800; F M 4.12 3.73 2.10 1.35 0.97 0.78 -3.73; 195/60R15 1; 1115 0.6 2.5 2.15 0.30",
			"2019 Fiesta ST (200)": "1.5 L3 TG 200 6000 290 1600 800 6800; F M 4.31 3.58 1.95 1.29 0.97 0.78 0.65 -3.33; 205/45ZR17 1; 1190 0.6 2.5 2.15 0.34"
		}, "Focus": {
            "2012 Focus 1.6 Ti-VCT (120)": "1.6 L4 NG 120 6400 140 4200 800 6500; F M 3.82 3.58 2.04 1.41 1.11 0.88 -3.62; 205/55R16 1; 1250 0.60 2.65 2.25 0.31",
            "2015 Focus 1.6 TDCi (115)": "1.6 L4 TD 115 3600 270 1750 800 5000; F M 3.61 3.73 2.05 1.26 0.92 0.74 0.62 -3.82; 205/55R16 1; 1261 0.60 2.5 2.25 0.31",
            "2016 Focus 2.0 TDCi (150)": "2.0 L4 TD 150 3750 350 2000 800 5000; F M 3.61 3.73 2.05 1.26 0.92 0.74 0.62 -3.82; 205/55R16 1; 1415 0.60 2.5 2.20 0.28",
            "2014 Focus ST (250)": "2.0 L4 TG 250 5500 340 2000 800 6500; F M 4.06 3.23 1.95 1.32 1.03 0.82 0.69 -3.34; 235/40ZR18 1; 1379 0.60 2.5 2.25 0.31",
        	"2016 Focus RS": "2.3 L4 TG 350 6000 470 2000 800 6500; A M 4.06 3.23 1.95 1.32 1.03 0.82 0.69 -3.34; 235/35ZR19 1; 1424 0.5 2.5 2.20 0.34",
            "2020 Focus ST (280)": "2.3 L4 TG 280 5500 420 3000 800 6500; F M 4.06 3.23 1.95 1.32 1.03 0.82 0.69 -3.34; 235/40ZR18 1; 1433 0.60 2.5 2.21 0.30",
        }, "Fusion": {
			"2008 Fusion 1.4 TDCi (70)": "1.4 L4 TD 70 4000 160 2000 800 5000; F M 3.37 3.58 1.93 1.28 0.95 0.76 -3.62; 195/55R16 1; 1059 0.5 2.5 2.20 0.35"
		}, "Escort": {
			"1970 Escors RS 1600": "1.6 L4 NG 120 6500 150 4000 800 7100; R M 3.78 2.97 2.01 1.40 1 -3.32; 175/70HR13 1; 890 0.5 2.5 1.80 0.45",
			"1994 Escort TD (90)": "1.8 L4 TD 90 4500 180 2200 800 5000; F M 3.56 3.42 2.14 1.45 1.03 0.77 -3.46; 175/70R13 1; 1140 0.5 2.5 2.00 0.35",
			"1995 Escort RS Cosworth": "2.0 L4 TG 225 5750 300 2500 800 6800; A M 3.62 3.61 2.08 1.36 1 0.83 -3.26; 245/45ZR16 1; 1345 0.5 2.5 2.05 0.35"
		}, "Sierra": {
			"1986 Sierra RS Cosworth": "2.0 L4 TG 205 6000 275 4500 800 7200; R M 3.64 2.95 1.94 1.34 1 0.80 -2.76; 205/50VR15 1; 1250 0.5 2.5 1.95 0.33"
		}, "Mustang": {
            "1967 Mustang GT": "4.7 V8 NG 225 4800 410 3200 800 6000; R M 3.00 2.99 1.75 1 -3.17; 210/70R14 1; 1321 0.5 2.5 2.00 0.50",
            "1969 Mustang Boss 302": "5.0 V8 NG 295 5800 390 4300 800 6300; R M 3.50 2.78 1.93 1.36 1 -2.78; 235/60R15 1; 1450 0.5 2.5 1.95 0.50",
            "2016 Mustang GT (420)": "5.0 V8 NG 420 6500 530 4250 800 7000; R M 3.55 3.66 2.43 1.69 1.32 1 0.65 -3.33; 255/40R19 275/40R19 1; 1720 0.5 2.5 2.20 0.32"
        }, "GT": {
            "1965 GT40": "4.7 V8 NG 390 6500 450 5000 800 7500; R M 4.22 2.42 1.47 1.14 1 0.85 -2.11 300; 255/60ZR15 325/60ZR15 1; 1005 0.5 2.5 1.50 0.40",
            "2005 GT": "5.4 V8 NG 560 6500 680 5900 800 7400; R M 3.36 2.61 1.71 1.23 0.94 0.77 0.63 -3.14 330; 235/45ZR18 315/40ZR19 1; 1520 0.5 2.5 1.80 0.31",
            "2018 GT": "3.5 V6 TG 655 6250 745 5900 800 7200; R D 3.67 3.40 2.19 1.63 1.29 1.03 0.84 0.63 -2.79 330; 245/35ZR20 325/30ZR20 1; 1385 0.5 2.5 1.80 0.40"
        }
	}
};