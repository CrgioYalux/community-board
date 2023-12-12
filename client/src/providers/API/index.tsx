import { API, APIAction, MemberExtended } from './types';

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
    const [member, setMember] = useState<MemberExtended | null>(null);
    const [logged, setLogged] = useState<boolean>(false);
    const [fetching, setFetching] = useState<boolean>(false);
    const [tryingReauth, setTryingReauth] = useState<boolean>(false);

    const Actions: API.Context['Actions'] = {
        Auth: {
            Register(payload) {
                return new Promise((resolve, reject) => {
                    setFetching(true);

                    axios.post<APIAction.Auth.Register.Result>(`${API_BASE_PATH}/auth/register`, payload)
                    .then((res) => {
                        if (!res.data.created) {
                            resolve({ created: false, message: res.data.message });
                            return;
                        }

                        resolve({ created: true });
                    })
                    .catch((err) => {
                        reject({ authRegisterError: err });
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
                        if (!res.data.authenticated) {
                            resolve({ authenticated: false, message: res.data.message });
                            return;
                        }

                        const { token, expiresIn } = res.data.payload;

                        const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(token), SECRET_KEY).toString();
                        const expires = Number(expiresIn.replace(/([A-Za-z])/gi, ''));
                        Cookies.set(COOKIE_KEY, encrypted, { sameSite: 'Strict', expires: isNaN(expires) ? undefined : expires });

                        axios.post<APIAction.Auth.Reauth.Result>(`${API_BASE_PATH}/auth/reauth`, {}, {
                            headers: { Authorization: `Bearer ${token}` },
                        })
                        .then((res1) => {
                            if (!res1.data.found) {
                                resolve({ authenticated: false, message: res1.data.message });
                                return;
                            }
                                
                            setMember(res1.data.payload);
                            setLogged(true);

                            resolve({ authenticated: true }); 
                        })
                        .catch((err) => {
                            reject({ authLoginError: err });
                        });
                    })
                    .catch((err) => {
                        reject({ authLoginError: err });
                    })
                    .finally(() => {
                        setFetching(false);
                    });
                });
            },
            Logout() {
                setMember(null);
                setLogged(false);
                Cookies.remove(COOKIE_KEY);
            },
            Reauth() {
                return new Promise((resolve, reject) => {
                    const token = utils.GetToken();

                    if (token === undefined) {
                        reject({ authReauthError: 'No token found' });
                        return;
                    }

                    setTryingReauth(true);
                    setFetching(true);

                    axios.post<APIAction.Auth.Reauth.Result>(`${API_BASE_PATH}/auth/reauth`, {}, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                    .then((res) => {
                        if (!res.data.found) {
                            resolve({ found: false, message: res.data.message });
                            return;
                        }
                            
                        setMember(res.data.payload);
                        setLogged(true);
                        resolve({ found: true });
                    })
                    .catch((err) => {
                        reject({ authReauthError: err });
                    })
                    .finally(() => {
                        setTryingReauth(false);
                        setFetching(false);
                    });
                });
            },
        },
        Posts: {
            SwitchSave(payload) {
                return new Promise((resolve, reject) => {
                    const token = utils.GetToken();

                    if (token === undefined) {
                        reject({ postsSwitchSaveError: 'No token found' });
                        return;
                    }

                    axios.patch<APIAction.Post.SwitchSave.Result>(`${API_BASE_PATH}/posts/${payload.post_id}/switch-save`, {}, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                    .then((res) => {
                        resolve(res.data);
                    })
                    .catch((err) => {
                        reject({ postsSwitchSaveError: err });
                    });
                });
            },
        },
        Feed: {
            Get() {
                return new Promise((resolve, reject) => {
                    const token = utils.GetToken();

                    if (token === undefined) {
                        reject({ feedGetError: 'No token found' });
                        return;
                    }

                    setFetching(true);

                    axios.get<APIAction.Feed.Get.Result>(`${API_BASE_PATH}/feed`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                    .then((res) => {
                        if (!res.data.found) {
                            resolve({ found: false, message: res.data.message });
                            return;
                        }

                        resolve({ found: true, posts: res.data.payload });
                    })
                    .catch((err) => {
                        reject({ feedGetError: err });
                    })
                    .finally(() => {
                        setFetching(false);
                    });
                });
            },
        },
    };

    const Value = { logged, fetching, member, tryingReauth } as API.Context['Value'];

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
