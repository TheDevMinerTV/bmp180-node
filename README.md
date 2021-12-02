# Node-BMP180

Read temperature and pressure from [BMP180](https://www.adafruit.com/product/1603) or [BMP085](https://www.adafruit.com/product/391) sensors using Node.js.

[![NPM](https://nodei.co/npm/node-bmp180.png)](https://npmjs.org/package/node-bmp180)

## Install

```
$ npm install node-bmp180
```

```
$ yarn add node-bmp180
```

## Usage

With no units specified this library returns temperature in Celsius and pressure in Pascal.

```javascript
const BMP180 = require('node-bmp180');

const sensor = new BMP180.BMP180({
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
const BMP180 = require('node-bmp180');

const sensor = new BMP180.BMP180({
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

- https://www.npmjs.com/package/bmp085-sensor
- https://github.com/dbridges/bmp085-sensor
