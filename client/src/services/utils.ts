import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';
import { ENV } from './config';

const COOKIE_TOKEN_KEY = `${ENV.COOKIE_STORAGE_KEY}_token`;

const getToken = (): string | null => {
	const token = Cookies.get(COOKIE_TOKEN_KEY);
	if (!token) return null;

	const bytes = CryptoJS.AES.decrypt(token, ENV.SECRET_KEY);
	const decrypted = bytes.toString(CryptoJS.enc.Utf8);

	return decrypted;
};

const storeToken = (token: string, expiresIn: string): void => {
	const encrypted = CryptoJS.AES.encrypt(
		CryptoJS.enc.Utf8.parse(token),
		ENV.SECRET_KEY
	).toString();

	const expires = Number(expiresIn.replace(/[A-Za-z]/gi, ''));

	Cookies.set(COOKIE_TOKEN_KEY, encrypted, {
		sameSite: 'Strict',
		expires: isNaN(expires) ? undefined : expires,
	});
};

const removeToken = (): void => {
	Cookies.remove(COOKIE_TOKEN_KEY);
};

export { getToken, storeToken, removeToken };
