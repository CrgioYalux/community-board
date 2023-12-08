const PONG = {
    GET: /^\/api\/ping\/?$/,
};

const AUTH = {
    REGISTER_MINIMAL: /^\/api\/auth\/register\/min?$/,
    REGISTER_DESCRIPTION: /^\/api\/auth\/register\/desc?$/,
    REGISTER_FULL: /^\/api\/auth\/register\/?$/,
    REGISTER: /^\/api\/auth\/register\/?$/,
    LOGIN: /^\/api\/auth\/login\/?$/,
    LOGOUT: /^\/api\/auth\/login\/?$/,
    RESET_PASSWORD: /^\/api\/auth\/login\/?$/,
};

const MEMBERS = {
    DELETE: /^\/api\/members\/(\d+)\/delete\/?$/,
    PATCH: /^\/api\/members\/(\d+)\/edit\/?$/,
    GET: /^\/api\/members\/?$/,
    GET_BY_ID: /^\/api\/members\/(\d+)\/?$/,
};

const AFFILIATES = {
    FOLLOW: /^\/api\/affiliates\/(\d+)\/follow\/?$/,
    UNFOLLOW: /^\/api\/affiliates\/(\d+)\/unfollow\/?$/,
};

const FOLLOWERS = {
    GET_REQUESTS: /^\/api\/followers\/requests\/?$/,
    ACCEPT_FOLLOW: /^\/api\/followers\/requests\/(\d+)\/accept\/?$/,
    DECLINE_FOLLOW: /^\/api\/followers\/requests\/(\d+)\/decline\/?$/,
};

const POSTS = {
    GET: /^\/api\/posts\/?$/,
    GET_BY_AFFILIATE_ID: /^\/api\/posts\/affiliate\/(\d+)\/?$/,
    POST: /^\/api\/posts\/?$/,
    SAVE: /^\/api\/posts\/(\d+)\/switch-save\/?$/,
    DELETE: /^\/api\/posts\/(\d+)\/delete\/?$/,
};

const ROUTE = {
    PONG,
    AUTH,
    MEMBERS,
    AFFILIATES,
    FOLLOWERS,
    POSTS,
};

export { ROUTE };
