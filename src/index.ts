const i2c = require('i2c');
import { promisify } from 'util';
import { BMP085_CONTROL_REGISTER, BMP085_CONVERSION_RESULT, BMP085_SELECT_PRESSURE, BMP085_SELECT_TEMP } from './constants';
import { SensorCalibrationData } from './interfaces';
import { PressureUnit, TemperatureUnit } from './units';
import { readPressure, readTemperature, sleep, toS16, toU16 } from './utlities';

interface SensorOptions {
	address?: number;
	mode?: number;
	units?: {
		temperature?: TemperatureUnit;
		pressure?: PressureUnit;
	};
}

export class BMP085 {
	private readonly address: number;
	private readonly mode: number;
	private readonly temperatureUnit: TemperatureUnit;
	private readonly pressureUnit: PressureUnit;

	private calibration?: SensorCalibrationData;

	// FIXME: This is a hack to get around the fact that the i2c module doesn't support TypeScript.
	private readonly wire: any;

	private readonly i2cScan: () => Promise<unknown[]>;
	private readonly i2cReadBytes: (register: number, bytes: number) => Promise<Buffer>;
	private readonly i2cWriteBytes: (register: number, bytes: number[]) => Promise<void>;

	constructor(options: SensorOptions = {}) {
		this.address = options.address ?? 0x77;
		this.mode = options.mode ?? 0;
		this.temperatureUnit = options.units?.temperature ?? TemperatureUnit.Celsius;
		this.pressureUnit = options.units?.pressure ?? PressureUnit.Pascal;

		this.wire = new i2c(this.address);

		this.i2cScan = promisify(this.wire.scan);
		this.i2cReadBytes = promisify(this.wire.readBytes);
		this.i2cWriteBytes = promisify(this.wire.writeBytes);
	}

	async scan(): Promise<unknown[]> {
		return this.i2cScan();
	}

	private async calibrate(): Promise<SensorCalibrationData> {
		const data = await this.i2cReadBytes(0xaa, 22);

		const calibrationData: SensorCalibrationData = {
			mode: this.mode,
			ac1: toS16(data[0], data[1]),
			ac2: toS16(data[2], data[3]),
			ac3: toS16(data[4], data[5]),
			ac4: toU16(data[6], data[7]),
			ac5: toU16(data[8], data[9]),
			ac6: toU16(data[10], data[11]),
			b1: toS16(data[12], data[13]),
			b2: toS16(data[14], data[15]),
			mb: toS16(data[16], data[17]),
			mc: toS16(data[18], data[19]),
			md: toS16(data[20], data[21])
		};

		this.calibration = calibrationData;

		return calibrationData;
	}

	async read() {
		let calibration: SensorCalibrationData = this.calibration ?? (await this.calibrate());

		// Write SELECT_PRESSURE command to control register
		await this.i2cWriteBytes(BMP085_CONTROL_REGISTER, [BMP085_SELECT_PRESSURE + (calibration.mode << 6)]);
		await sleep(28);

		// Read uncalibrated pressure.
		const uncalibratedPressureData = await this.i2cReadBytes(BMP085_CONVERSION_RESULT, 3);
		const uncalibratedPressure =
			((uncalibratedPressureData[0] << 16) + (uncalibratedPressureData[1] << 8) + uncalibratedPressureData[2]) >> (8 - calibration.mode);

		// Write SELECT_TEMPERATURE command to control register
		await this.i2cWriteBytes(BMP085_CONTROL_REGISTER, [BMP085_SELECT_TEMP]);
		await sleep(8);

		// Read uncalibrated temperature.
		let uncalibratedTemperatureData = await this.i2cReadBytes(BMP085_CONVERSION_RESULT, 2);
		const uncalibratedTemperature = toU16(uncalibratedTemperatureData[0], uncalibratedTemperatureData[1]);

		return {
			pressure: readPressure(uncalibratedTemperature, uncalibratedPressure, calibration, this.pressureUnit),
			temperature: readTemperature(uncalibratedTemperature, calibration, this.temperatureUnit)
		};
	}
}

// Provide legacy support
export default BMP085;
