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

                    axios.patch<APIAction.Posts.SwitchSave.Result>(`${API_BASE_PATH}/posts/${payload.post_id}/switch-save`, {}, {
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
            Create(payload) {
                return new Promise((resolve, reject) => {
                    const token = utils.GetToken();

                    if (token === undefined) {
                        reject({ postsCreateError: 'No token found' });
                        return;
                    }

                    axios.post<APIAction.Posts.Create.Result>(`${API_BASE_PATH}/posts/`, payload, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                    .then((res) => {
                        if (!res.data.created) {
                            resolve({ created: false, message: res.data.message });
                            return;
                        }

                        resolve({ created: true, post: { post_id: res.data.payload.post_id } });
                    })
                    .catch((err) => {
                        reject({ postsCreateError: err });
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
            GetSaved() {
                return new Promise((resolve, reject) => {
                    const token = utils.GetToken();

                    if (token === undefined) {
                        reject({ feedGetSavedError: 'No token found' });
                        return;
                    }

                    setFetching(true);

                    axios.get<APIAction.Feed.GetSaved.Result>(`${API_BASE_PATH}/feed/saved`, {
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
                        reject({ feedGetSavedError: err });
                    })
                    .finally(() => {
                        setFetching(false);
                    });
                });
            },
            GetFromAffiliateID(payload) {
                return new Promise((resolve, reject) => {
                    const token = utils.GetToken();

                    if (token === undefined) {
                        reject({ feedGetFromAffiliateIDError: 'No token found' });
                        return;
                    }

                    setFetching(true);

                    axios.get<APIAction.Feed.GetFromAffiliateID.Result>(`${API_BASE_PATH}/feed/affiliate/${payload.affiliate_id}`, {
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
                        reject({ feedGetFromAffiliateIDError: err });
                    })
                    .finally(() => {
                        setFetching(false);
                    });
                });
            },
        },
        Members: {
            GetFromMemberPovByUsername(payload) {
                return new Promise((resolve, reject) => {
                    const token = utils.GetToken();

                    if (token === undefined) {
                        reject({ membersGetFromMemberPovByUsernameError: 'No token found' });
                        return;
                    }

                    setFetching(true);

                    axios.get<APIAction.Members.GetFromMemberPovByUsername.Result>(`${API_BASE_PATH}/members/${payload.username}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                    .then((res) => {
                        if (!res.data.found) {
                            resolve({ found: false, message: res.data.message });
                            return;
                        }

                        resolve({ found: true, member: res.data.payload });
                    })
                    .catch((err) => {
                        reject({ membersGetFromMemberPovByUsernameError: err });
                    })
                    .finally(() => {
                        setFetching(false);
                    });
                    
                });
            },
        },
        Followers: {
            GetRequests() {
                return new Promise((resolve, reject) => {
                    const token = utils.GetToken();

                    if (token === undefined) {
                        reject({ followersGetRequestsError: 'No token found' });
                        return;
                    }

                    setFetching(true);

                    axios.get<APIAction.Followers.GetRequests.Result>(`${API_BASE_PATH}/followers/requests`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                    .then((res) => {
                        if (!res.data.found) {
                            resolve({ found: false, message: res.data.message });
                            return;
                        }

                        resolve({ found: true, requests: res.data.payload });
                    })
                    .catch((err) => {
                        reject({ followersGetRequestsError: err });
                    })
                    .finally(() => {
                        setFetching(false);
                    });
                });
            },
            AcceptRequest(payload) {
                return new Promise((resolve, reject) => {
                    const token = utils.GetToken();

                    if (token === undefined) {
                        reject({ followersAcceptRequestError: 'No token found' });
                        return;
                    }
                    
                    axios.patch<APIAction.Followers.AcceptRequest.Result>(`${API_BASE_PATH}/followers/requests/${payload.follow_request_id}/accept`, {}, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                    .then((res) => {
                        if (!res.data.done) {
                            resolve({ done: false, message: res.data.message });
                            return;
                        }

                        setMember((prev) => {
                            if (prev === null) return prev;
                            
                            return {
                                ...prev,
                                followers: prev.followers + 1,
                            };
                        });

                        resolve({ done: true });
                    })
                    .catch((err) => {
                        reject({ followersAcceptRequestError: err });
                    });
                });
            },
            DeclineRequest(payload) {
                return new Promise((resolve, reject) => {
                    const token = utils.GetToken();

                    if (token === undefined) {
                        reject({ followersDeclineRequestError: 'No token found' });
                        return;
                    }

                    axios.delete<APIAction.Followers.DeclineRequest.Result>(`${API_BASE_PATH}/followers/requests/${payload.follow_request_id}/decline`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                    .then((res) => {
                        if (!res.data.done) {
                            resolve({ done: false, message: res.data.message });
                            return;
                        }

                        resolve({ done: true });
                    })
                    .catch((err) => {
                        reject({ followersDeclineRequestError: err });
                    });
                });
            },
        },
        Affiliates: {
            Follow(payload) {
                return new Promise((resolve, reject) => {
                    const token = utils.GetToken();

                    if (token === undefined) {
                        reject({ affiliatesFollowError: 'No token found' });
                        return;
                    }

                    axios.get<APIAction.Affiliates.Follow.Result>(`${API_BASE_PATH}/affiliates/${payload.affiliate_id}/follow`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                    .then((res) => {
                        if (!res.data.done) {
                            resolve({ done: false, message: res.data.message });
                            return;
                        }

                        resolve({ done: true, follow_request_id: res.data.payload.follow_request_id });
                    })
                    .catch((err) => {
                        reject({ affiliatesFollowError: err });
                    });
                });
            },
            Unfollow(payload) {
                return new Promise((resolve, reject) => {
                    const token = utils.GetToken();

                    if (token === undefined) {
                        reject({ affiliatesUnfollowError: 'No token found' });
                        return;
                    }

                    axios.get<APIAction.Affiliates.Unfollow.Result>(`${API_BASE_PATH}/affiliates/${payload.affiliate_id}/unfollow`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                    .then((res) => {
                        if (!res.data.done) {
                            resolve({ done: false, message: res.data.message });
                            return;
                        }

                        resolve({ done: true });
                    })
                    .catch((err) => {
                        reject({ affiliatesUnfollowError: err });
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
