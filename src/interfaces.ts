import { Mode } from './modes';

export interface SensorCalibrationData {
	ac1: number;
	ac2: number;
	ac3: number;
	ac4: number;
	ac5: number;
	ac6: number;
	b1: number;
	b2: number;
	mb: number;
	mc: number;
	md: number;
	mode: Mode;
}
