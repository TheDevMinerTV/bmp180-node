import { SensorCalibrationData } from './interfaces';
import { PressureUnit, TemperatureUnit, toFahrenheit, toInchesOfMercury } from './units';

export const toS16 = (high: number, low: number) => {
	if (high > 127) {
		high -= 256;
	}

	return (high << 8) + low;
};

export const toU16 = (high: number, low: number) => {
	return (high << 8) + low;
};

export const sleep = (ms: number) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

export const readTemperature = (uncalibratedTemperature: number, calibration: SensorCalibrationData, unit: TemperatureUnit = TemperatureUnit.Celsius) => {
	const x1 = ((uncalibratedTemperature - calibration.ac6) * calibration.ac5) >> 15;
	const x2 = (calibration.mc << 11) / (x1 + calibration.md);
	const b5 = x1 + x2;

	let temperature = ((b5 + 8) >> 4) / 10.0;

	if (unit === TemperatureUnit.Celsius) {
		return temperature;
	}

	return toFahrenheit(temperature);
};

export const readPressure = (
	uncalibratedTemperature: number,
	uncalibratedPressure: number,
	calibration: SensorCalibrationData,
	unit: PressureUnit = PressureUnit.Pascal
) => {
	let x1 = ((uncalibratedTemperature - calibration.ac6) * calibration.ac5) >> 15;
	let x2 = (calibration.mc << 11) / (x1 + calibration.md);
	let b5 = x1 + x2;

	let b6 = b5 - 4000;
	x1 = ((calibration.b2 * b6 ** 2) >> 12) >> 11;
	x2 = (calibration.ac2 * b6) >> 11;
	let x3 = x1 + x2;
	let b3 = (((calibration.ac1 * 4 + x3) << calibration.mode) + 2) / 4;
	x1 = (calibration.ac3 * b6) >> 13;
	x2 = (calibration.b1 * ((b6 ** 2) >> 12)) >> 16;
	x3 = (x1 + x2 + 2) >> 2;
	let b4 = (calibration.ac4 * (x3 + 32768)) >> 15;
	let b7 = (uncalibratedPressure - b3) * (50000 >> calibration.mode);

	let pressure = b7 < 0x80000000 ? (b7 * 2) / b4 : (b7 / b4) * 2;

	x1 = (pressure >> 8) * (pressure >> 8);
	x1 = (x1 * 3038) >> 16;
	x2 = (-7357 * pressure) >> 16;

	pressure = pressure + ((x1 + x2 + 3791) >> 4);

	if (unit === PressureUnit.Pascal) {
		return pressure;
	}

	return toInchesOfMercury(pressure);
};
