export namespace Theme {
	type Value = 'light' | 'dark';
	type Context = readonly [
		theme: {
			current: Theme;
			opposite: Theme;
		},
		switchTheme: () => void,
	];
}
