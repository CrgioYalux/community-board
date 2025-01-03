import { AuthService } from '../../services/Auth';
import { MemberExtended } from '../../services/types';

import { createContext, useContext, useEffect, useState } from 'react';

interface ISessionContext {
	state: { isLogged: boolean; member: MemberExtended | null };
	actions: {
		login: typeof AuthService.login;
		logout: typeof AuthService.logout;
		register: typeof AuthService.register;
	};
}

const Context = createContext<ISessionContext>({} as ISessionContext);

const SessionContextProvider: React.FC<{
	children: React.ReactNode;
}> = ({ children }) => {
	const [isLogged, setIsLogged] = useState<boolean>(false);
	const [member, setMember] = useState<MemberExtended | null>(null);

	const context: ISessionContext = {
		state: {
			isLogged,
			member,
		},
		actions: {
			login: (payload) => {
				return new Promise((resolve, reject) => {
					AuthService.login(payload)
						.then((res) => {
							if (res.success) {
								setMember(res.payload);
								setIsLogged(true);
							}

							resolve(res);

							// register the action regardless
						})
						.catch((err) => {
							reject(err);

							// register the action regardless
						});
				});
			},
			register: (payload) => {
				return AuthService.register(payload);
			},
			logout: () => {
				return AuthService.logout();
			},
		},
	};

	useEffect(() => {
		AuthService.reauth()
			.then((res) => {
				if (res.success) {
					setMember(res.payload);
					setIsLogged(true);
				}

				// register the action regardless
			})
			.catch(() => {
				// register the action regardless
			});
	}, []);

	return <Context.Provider value={context}>{children}</Context.Provider>;
};

export const useSession = () => useContext(Context);
export default SessionContextProvider;
