# BMP180

Read temperature and pressure from [BMP180](https://www.adafruit.com/product/1603) or [BMP085](https://www.adafruit.com/product/391) using Node.js.

[![NPM](https://nodei.co/npm/bmp180.png)](https://npmjs.org/package/bmp180)

## Install

```
$ npm install bmp180
```

```
$ yarn add bmp180
```

## Usage

With no units specified this library returns temperature in Celsius and pressure in Pascal.

```javascript
const BMP180 = require('bmp180');

const sensor = new BMP180({
	address: 0x77,
	mode: BMP180.Mode.UltraHighResolution
});

(async () => {
	const { pressure, temp } = await sensor.read();

	console.log(`Pressure: ${pressure} Pa`);
	console.log(`Temperature: ${temp} C`);
})();
```

```javascript
const BMP180 = require('bmp180');

const sensor = new BMP180({
	address: 0x77,
	mode: BMP180.Mode.UltraHighResolution,
	units: {
		temperature: BMP180.TemperatureUnit.Fahrenheit,
		pressure: BMP180.PressureUnit.InchesOfMercury
	}
});

(async () => {
	const { pressure, temp } = await sensor.read();

	console.log(`Pressure: ${pressure} inHg`);
	console.log(`Temperature: ${temp} F`);
})();
```

## Legacy package

-   https://www.npmjs.com/package/bmp180-sensor
-   https://github.com/dbridges/bmp180-sensor
