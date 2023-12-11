import { API, APIAction, SessionData, MemberExtended } from './types';

import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';

import { API_BASE_PATH, SECRET_KEY, COOKIE_KEY } from './consts';

const Context = createContext<API.Context>({} as API.Context);

const utils: API.Utils = {
    GetToken() {
        const token = Cookies.get(COOKIE_KEY);
        if (token === undefined) return undefined;

        const bytes = CryptoJS.AES.decrypt(token, SECRET_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

        return decrypted;
    },
};

const APIContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<SessionData | null>(null);
    const [member, setMember] = useState<MemberExtended | null>(null);
    const [logged, setLogged] = useState<boolean>(false);
    const [fetching, setFetching] = useState<boolean>(false);
    const [tryingReauth, setTryingReauth] = useState<boolean>(false);

    const Actions: API.Context['Actions'] = {
        Auth: {
            Register(payload) {
                return new Promise((resolve, reject) => {
                    setFetching(true);

                    axios.post(`${API_BASE_PATH}/auth/register`, payload)
                    .then((res) => {
                        resolve(res.data);
                    })
                    .catch((err) => {
                        console.error({ registerError: err });
                        reject(err);
                    })
                    .finally(() => {
                        setFetching(false);
                    });
                });
            },
            Login(payload) {
                return new Promise((resolve, reject) => {
                    setFetching(true);

                    axios.post<APIAction.Auth.Login.Result>(`${API_BASE_PATH}/auth/login`, payload)
                    .then((res) => {
                        if (res.data.authenticated) {
                            const { token, expiresIn, ...rest } = res.data.payload;
                            setSession(rest);

                            const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(token), SECRET_KEY).toString();
                            const expires = Number(expiresIn.replace(/([A-Za-z])/gi, ''));
                            Cookies.set(COOKIE_KEY, encrypted, { sameSite: 'Strict', expires: isNaN(expires) ? undefined : expires });

                            setLogged(true);
                        }

                        resolve(res.data);
                    })
                    .catch((err) => {
                        console.error({ loginError: err });
                        reject(err);
                    })
                    .finally(() => {
                        setFetching(false);
                    });
                });
            },
            Logout() {
                setSession(null);
                setLogged(false);
                Cookies.remove(COOKIE_KEY);
            },
            Reauth() {
                return new Promise((resolve, reject) => {
                    const token = utils.GetToken();

                    if (token === undefined) {
                        resolve({ found: false, message: '' });
                        return;
                    }

                    setTryingReauth(true);
                    setFetching(true);

                    axios.post<APIAction.Auth.Reauth.Result>(`${API_BASE_PATH}/auth/reauth`, {}, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                    .then((res) => {
                        if (!res.data.found) {
                            resolve(res.data);
                            return;
                        }
                            
                        setMember(res.data.payload);
                        setLogged(true);
                    })
                    .catch((err) => {
                        console.error({ reauthError: err });
                        reject(err);
                    })
                    .finally(() => {
                        setTryingReauth(false);
                        setFetching(false);
                    });
                });
            },
        },
    };

    const Value = { logged, session, fetching, member, tryingReauth } as API.Context['Value'];

    const value: API.Context = {
        Value,
        Actions,
    };

    useEffect(() => {
        Actions.Auth.Reauth();
    }, []);

    return (
        <Context.Provider value={value}>
            {children}
        </Context.Provider>
    );
};

export default APIContextProvider;
export const useAPI = () => useContext<API.Context>(Context);
