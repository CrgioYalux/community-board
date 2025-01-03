const actions = {
	AUTH: {
		LOGIN: {
			SYSTEM: {},
			RESPONSE: {},
		},
		LOGOUT: {
			SYSTEM: {},
			RESPONSE: {},
		},
		REGISTER: {
			SYSTEM: {},
			RESPONSE: {},
		},
		REAUTH: {
			SYSTEM: {},
			RESPONSE: {},
		},
	},
} as const;

const addUnderscoreFields = (
	obj: Record<string, any>,
	prevKey: string = ''
): Record<string, any> => {
	return Object.entries(obj).reduce(
		(acc, [key, value]) => ({
			...acc,
			[key]: {
				...{
					_: `${prevKey}${key}`,
					...(!Object.keys(value).length
						? {}
						: {
								[key]: addUnderscoreFields(
									value,
									`${prevKey}${key}.`
								),
							}),
				},
			},
		}),
		{}
	);
};

type UnderscoredObject<T> = {
	[K in keyof T]: T[K] extends object
		? UnderscoredObject<T[K]> & { _: string }
		: T[K];
};

export type ACTIONS = typeof actions;
export const ACTION = addUnderscoreFields(actions) as UnderscoredObject<
	typeof actions
>;
