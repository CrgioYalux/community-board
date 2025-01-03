const PONG = {
	GET: /^\/api\/ping\/?$/,
};

const AUTH = {
	REGISTER_MINIMAL: /^\/api\/auth\/register\/min?$/,
	REGISTER_DESCRIPTION: /^\/api\/auth\/register\/desc?$/,
	REGISTER_FULL: /^\/api\/auth\/register\/?$/,
	REGISTER: /^\/api\/auth\/register\/?$/,
	LOGIN: /^\/api\/auth\/login\/?$/,
	REAUTH: /^\/api\/auth\/reauth\/?$/,
	LOGOUT: /^\/api\/auth\/login\/?$/,
	RESET_PASSWORD: /^\/api\/auth\/login\/?$/,
};

const MEMBERS = {
	DELETE: /^\/api\/members\/(\d+)\/delete\/?$/,
	PATCH: /^\/api\/members\/(\d+)\/edit\/?$/,
	GET: /^\/api\/members\/?$/,
	GET_BY_ID: /^\/api\/members\/(\d+)\/?$/,
	GET_FROM_MEMBER_POV_BY_USERNAME: /^\/api\/members\/(\w+)\/?$/,
};

const AFFILIATES = {
	FOLLOW: /^\/api\/affiliates\/(\d+)\/follow\/?$/,
	UNFOLLOW: /^\/api\/affiliates\/(\d+)\/unfollow\/?$/,
};

const FOLLOWERS = {
	GET: /^\/api\/followers\/affiliate\/(\d+)\/?$/,
	GET_REQUESTS: /^\/api\/followers\/requests\/?$/,
	ACCEPT_FOLLOW: /^\/api\/followers\/requests\/(\d+)\/accept\/?$/,
	DECLINE_FOLLOW: /^\/api\/followers\/requests\/(\d+)\/decline\/?$/,
};

const FOLLOWEES = {
	GET: /^\/api\/followees\/affiliate\/(\d+)\/?$/,
};

const POSTS = {
	POST: /^\/api\/posts\/?$/,
	SWITCH_SAVE: /^\/api\/posts\/(\d+)\/switch-save\/?$/,
	DELETE: /^\/api\/posts\/(\d+)\/delete\/?$/,
};

const FEED = {
	GET: /^\/api\/feed\/?$/,
	GET_FROM_AFFILIATE_ID: /^\/api\/feed\/affiliate\/(\d+)\/?$/,
	GET_SAVED: /^\/api\/feed\/saved\/?$/,
};

const ROUTE = {
	PONG,
	AUTH,
	MEMBERS,
	AFFILIATES,
	FOLLOWERS,
	FOLLOWEES,
	POSTS,
	FEED,
};

export { ROUTE };
