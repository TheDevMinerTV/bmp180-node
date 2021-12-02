export enum PressureUnit {
	Pascal = 'Pascal',
	InchesOfMercury = 'InchesofMercury'
}

export enum TemperatureUnit {
	Celsius = 'Celsius',
	Fahrenheit = 'Fahrenheit'
}

export const toFahrenheit = (celsius: number) => {
	return (celsius * 9) / 5 + 32;
};

export const toInchesOfMercury = (pascal: number) => {
	return pascal / 3386;
};
