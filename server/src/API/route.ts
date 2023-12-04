const PONG = {
    GET: /^\/api\/ping\/?$/,
};

const MEMBERS = {
    AUTH: /^\/api\/members\/auth\/?$/,
    POST_MINIMAL: /^\/api\/members\/minimal\/?$/,
    POST_DESCRIPTION: /^\/api\/members\/(\d+)\/description\/?$/,
    POST_FULL: /^\/api\/members\/full\/?$/,
    DELETE: /^\/api\/members\/(\d+)\/?$/,
    PATCH: /^\/api\/members\/(\d+)\/?$/,
};

const ROUTE = {
    PONG,
    MEMBERS,
};

export { ROUTE };
