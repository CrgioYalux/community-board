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
    FOLLOW: /^\/api\/members\/(\d+)\/follow\/?$/,
    PATCH: /^\/api\/members\/(\d+)\/edit\/?$/,
    GET: /^\/api\/members\/?$/,
    GET_BY_ID: /^\/api\/members\/(\d+)\/?$/,
};

const POSTS = {
    POST: /^\/api\/posts\/?$/,
    SAVE: /^\/api\/posts\/(\d+)\/switch-save\/?$/,
    DELETE: /^\/api\/posts\/(\d+)\/delete\/?$/,
};

const ROUTE = {
    PONG,
    AUTH,
    MEMBERS,
    POSTS,
};

export { ROUTE };
