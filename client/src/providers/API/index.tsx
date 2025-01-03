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

const APIContextProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [member, setMember] = useState<MemberExtended | null>(null);
	const [logged, setLogged] = useState<boolean>(false);
	const [fetching, setFetching] = useState<boolean>(false);
	const [tryingReauth, setTryingReauth] = useState<boolean>(false);

	const Auth: API.Context['Actions']['Auth'] = {
		Register(payload) {
			return new Promise((resolve, reject) => {
				axios
					.post<APIAction.Auth.Register.Result>(
						`${API_BASE_PATH}/auth/register`,
						payload
					)
					.then((res) => {
						if (!res.data.created) {
							resolve({
								created: false,
								message: res.data.message,
							});
							return;
						}

						resolve({ created: true });
					})
					.catch((err) => {
						reject({ authRegisterError: err });
					});
			});
		},
		Logout() {
			setMember(null);
			setLogged(false);
			Cookies.remove(COOKIE_KEY);
		},
		Login(payload) {
			return new Promise((resolve, reject) => {
				setFetching(true);

				axios
					.post<APIAction.Auth.Login.Result>(
						`${API_BASE_PATH}/auth/login`,
						payload
					)
					.then((res) => {
						if (!res.data.authenticated) {
							resolve({
								authenticated: false,
								message: res.data.message,
							});
							return;
						}

						const { token, expiresIn } = res.data.payload;

						const encrypted = CryptoJS.AES.encrypt(
							CryptoJS.enc.Utf8.parse(token),
							SECRET_KEY
						).toString();
						const expires = Number(
							expiresIn.replace(/([A-Za-z])/gi, '')
						);
						Cookies.set(COOKIE_KEY, encrypted, {
							sameSite: 'Strict',
							expires: isNaN(expires) ? undefined : expires,
						});

						this.Reauth().catch(console.error);
					})
					.catch((err) => {
						reject({ authLoginError: err });
					})
					.finally(() => {
						setFetching(false);
					});
			});
		},
		Reauth() {
			return new Promise((resolve, reject) => {
				const token = utils.GetToken();

				if (token === undefined) {
					reject({ authReauthError: 'No token found' });
					return;
				}

				setTryingReauth(true);

				axios
					.post<APIAction.Auth.Reauth.Result>(
						`${API_BASE_PATH}/auth/reauth`,
						{},
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					)
					.then((res) => {
						if (!res.data.found) {
							resolve({
								found: false,
								message: res.data.message,
							});
							this.Logout();
							return;
						}

						setLogged(true);
						setMember(res.data.payload);
						resolve({ found: true });
					})
					.catch((err) => {
						reject({ authReauthError: err });
						this.Logout();
					})
					.finally(() => {
						setTryingReauth(false);
					});
			});
		},
	};

	const Posts: API.Context['Actions']['Posts'] = {
		SwitchSave(payload) {
			return new Promise((resolve, reject) => {
				const token = utils.GetToken();

				if (token === undefined) {
					reject({ postsSwitchSaveError: 'No token found' });
					return;
				}

				axios
					.patch<APIAction.Posts.SwitchSave.Result>(
						`${API_BASE_PATH}/posts/${payload.post_id}/switch-save`,
						{},
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					)
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

				axios
					.post<APIAction.Posts.Create.Result>(
						`${API_BASE_PATH}/posts/`,
						payload,
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					)
					.then((res) => {
						if (!res.data.created) {
							resolve({
								created: false,
								message: res.data.message,
							});
							return;
						}

						resolve({
							created: true,
							post: { post_id: res.data.payload.post_id },
						});
					})
					.catch((err) => {
						reject({ postsCreateError: err });
					});
			});
		},
		Delete(payload) {
			return new Promise((resolve, reject) => {
				const token = utils.GetToken();

				if (token === undefined) {
					reject({ postsDeleteError: 'No token found' });
					return;
				}

				axios
					.delete<APIAction.Posts.Delete.Result>(
						`${API_BASE_PATH}/posts/${payload.post_id}/delete`,
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					)
					.then((res) => {
						resolve(res.data);
					})
					.catch((err) => {
						reject({ postsDeleteError: err });
					});
			});
		},
	};

	const Feed: API.Context['Actions']['Feed'] = {
		Get() {
			return new Promise((resolve, reject) => {
				const token = utils.GetToken();

				if (token === undefined) {
					reject({ feedGetError: 'No token found' });
					return;
				}

				setFetching(true);

				axios
					.get<APIAction.Feed.Get.Result>(`${API_BASE_PATH}/feed`, {
						headers: { Authorization: `Bearer ${token}` },
					})
					.then((res) => {
						if (!res.data.found) {
							resolve({
								found: false,
								message: res.data.message,
							});
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

				axios
					.get<APIAction.Feed.GetSaved.Result>(
						`${API_BASE_PATH}/feed/saved`,
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					)
					.then((res) => {
						if (!res.data.found) {
							resolve({
								found: false,
								message: res.data.message,
							});
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

				axios
					.get<APIAction.Feed.GetFromAffiliateID.Result>(
						`${API_BASE_PATH}/feed/affiliate/${payload.affiliate_id}`,
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					)
					.then((res) => {
						if (!res.data.found) {
							resolve({
								found: false,
								message: res.data.message,
							});
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
	};

	const Members: API.Context['Actions']['Members'] = {
		GetFromMemberPovByUsername(payload) {
			return new Promise((resolve, reject) => {
				const token = utils.GetToken();

				if (token === undefined) {
					reject({
						membersGetFromMemberPovByUsernameError:
							'No token found',
					});
					return;
				}

				setFetching(true);

				axios
					.get<APIAction.Members.GetFromMemberPovByUsername.Result>(
						`${API_BASE_PATH}/members/${payload.username}`,
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					)
					.then((res) => {
						if (!res.data.found) {
							resolve({
								found: false,
								message: res.data.message,
							});
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
		Edit(payload) {
			return new Promise((resolve, reject) => {
				const token = utils.GetToken();

				if (token === undefined) {
					reject({ membersEditError: 'No token found' });
					return;
				}

				if (member === null) {
					reject({ membersEditError: 'No session' });
					return;
				}

				const { birthdate } = payload;
				const sanitizedBirthdate = !birthdate ? null : birthdate;

				axios
					.patch<APIAction.Members.Edit.Result>(
						`${API_BASE_PATH}/members/${member.member_id}/edit`,
						{ ...payload, birthdate: sanitizedBirthdate },
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					)
					.then((res) => {
						if (!res.data.done) {
							resolve({ done: false, message: res.data.message });
							return;
						}

						resolve({ done: true });
					})
					.catch((err) => {
						reject({ membersEditError: err });
					});
			});
		},
	};

	const Followers: API.Context['Actions']['Followers'] = {
		GetRequests() {
			return new Promise((resolve, reject) => {
				const token = utils.GetToken();

				if (token === undefined) {
					reject({ followersGetRequestsError: 'No token found' });
					return;
				}

				setFetching(true);

				axios
					.get<APIAction.Followers.GetRequests.Result>(
						`${API_BASE_PATH}/followers/requests`,
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					)
					.then((res) => {
						if (!res.data.found) {
							resolve({
								found: false,
								message: res.data.message,
							});
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

				axios
					.patch<APIAction.Followers.AcceptRequest.Result>(
						`${API_BASE_PATH}/followers/requests/${payload.follow_request_id}/accept`,
						{},
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					)
					.then((res) => {
						if (!res.data.done) {
							resolve({ done: false, message: res.data.message });
							return;
						}

						Auth.Reauth().catch(console.error);

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

				axios
					.delete<APIAction.Followers.DeclineRequest.Result>(
						`${API_BASE_PATH}/followers/requests/${payload.follow_request_id}/decline`,
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					)
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
		Get(payload) {
			return new Promise((resolve, reject) => {
				const token = utils.GetToken();

				if (token === undefined) {
					reject({ followersGetError: 'No token found' });
					return;
				}

				setFetching(true);

				axios
					.get<APIAction.Followers.Get.Result>(
						`${API_BASE_PATH}/followers/affiliate/${payload.consultant_affiliate_id}`,
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					)
					.then((res) => {
						if (!res.data.found) {
							resolve({
								found: false,
								message: res.data.message,
							});
							return;
						}

						resolve({ found: true, followers: res.data.payload });
					})
					.catch((err) => {
						reject({ followersGetError: err });
					})
					.finally(() => {
						setFetching(false);
					});
			});
		},
	};

	const Followees: API.Context['Actions']['Followees'] = {
		Get(payload) {
			return new Promise((resolve, reject) => {
				const token = utils.GetToken();

				if (token === undefined) {
					reject({ followeesGetError: 'No token found' });
					return;
				}

				setFetching(true);

				axios
					.get<APIAction.Followers.Get.Result>(
						`${API_BASE_PATH}/followees/affiliate/${payload.consultant_affiliate_id}`,
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					)
					.then((res) => {
						if (!res.data.found) {
							resolve({
								found: false,
								message: res.data.message,
							});
							return;
						}

						resolve({ found: true, followees: res.data.payload });
					})
					.catch((err) => {
						reject({ followeesGetError: err });
					})
					.finally(() => {
						setFetching(false);
					});
			});
		},
	};

	const Affiliates: API.Context['Actions']['Affiliates'] = {
		Follow(payload) {
			return new Promise((resolve, reject) => {
				const token = utils.GetToken();

				if (token === undefined) {
					reject({ affiliatesFollowError: 'No token found' });
					return;
				}

				axios
					.post<APIAction.Affiliates.Follow.Result>(
						`${API_BASE_PATH}/affiliates/${payload.affiliate_id}/follow`,
						{},
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					)
					.then((res) => {
						if (!res.data.done) {
							resolve({ done: false, message: res.data.message });
							return;
						}

						resolve({
							done: true,
							follow_request_id:
								res.data.payload.follow_request_id,
						});
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

				axios
					.delete<APIAction.Affiliates.Unfollow.Result>(
						`${API_BASE_PATH}/affiliates/${payload.affiliate_id}/unfollow`,
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					)
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
	};

	const Value = {
		logged,
		fetching,
		member,
		tryingReauth,
	} as API.Context['Value'];

	const Actions: API.Context['Actions'] = {
		Auth,
		Posts,
		Feed,
		Members,
		Followers,
		Followees,
		Affiliates,
	};

	const value: API.Context = {
		Value,
		Actions,
	};

	useEffect(() => {
		Auth.Reauth().catch(console.error);
	}, []);

	return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default APIContextProvider;
export const useAPI = () => useContext<API.Context>(Context);
