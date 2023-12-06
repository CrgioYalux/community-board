const PONG = {
    GET: /^\/api\/ping\/?$/,
};

const MEMBERS = {
    AUTH: /^\/api\/members\/auth\/?$/,
    POST_MINIMAL: /^\/api\/members\/minimal\/?$/,
    POST_DESCRIPTION: /^\/api\/members\/(\d+)\/description\/?$/,
    POST_FULL: /^\/api\/members\/full\/?$/,
    DELETE: /^\/api\/members\/(\d+)\/?$/,
    FOLLOW: /^\/api\/members\/follow\/(\d+)\/?$/,
    PATCH: /^\/api\/members\/(\d+)\/?$/,
    GET: /^\/api\/members\/?$/,
    GET_BY_ID: /^\/api\/members\/(\d+)\/?$/,
};

const POSTS = {
    POST: /^\/api\/posts\/?$/,
    SAVE: /^\/api\/posts\/switch_save\/(\d+)\/?$/,
    DELETE: /^\/api\/posts\/(\d+)\/?$/,
};

const ROUTE = {
    PONG,
    MEMBERS,
    POSTS,
};

export { ROUTE };
