// type EffectlessOperationResult<T> = { found: true, payload: T } | { found: false, message: string };

export type SessionData = {
    entity_id: number;
    affiliate_id: number;
    member_id: number;
    has_description: boolean;
    is_active: boolean;
    is_private: boolean;
};

export type SessionAccess = {
    token: string;
    expiresIn: string;
};

export type MemberExtended = {
    affiliate_id: number;
    member_id: number;
    username: string;
    email: string;
    fullname: string;
    bio: string;
    birthdate: Date;
    is_private: boolean;
    created_at: Date;
    followees: number;
    followers: number;
};

export namespace APIAction {
    namespace Auth {
        namespace Register {
            type Payload = {
                username: string;
                password: string;
                email: string;
                fullname: string;
            };
            type Result = {
                created: true;
                payload: SessionData & SessionAccess;
            } | {
                created: false;
                message: string;
            };
        };
        namespace Login {
            type Payload = {
                username: string;
                password: string;
            };
            type Result = {
                authenticated: true;
                payload: SessionData & SessionAccess;
            } | {
                authenticated: false;
                message: string;
            };
        };
        namespace Logout {
            type Result = { done: boolean };
        };
        namespace Reauth {
            type Result = {
                found: true;
                payload: MemberExtended;
            } | {
                found: false;
                message: string;
            };
        };
    };
};

export namespace API {
    interface Utils {
        GetToken: () => string | undefined;
    };
    interface Context {
        Value: {
            member: MemberExtended;
            logged: true;
            fetching: boolean;
            session: Session;
            tryingReauth: boolean;
        } | {
            member: null;
            logged: false;
            fetching: boolean;
            session: null;
            tryingReauth: boolean;
        };
        Actions: {
            Auth: {
                Register: (payload: APIAction.Auth.Register.Payload) => Promise<{ created: true } | { created: false, message: string }>;
                Login: (payload: APIAction.Auth.Login.Payload) => Promise<{ authenticated: true } | { authenticated: false, message: string }>;
                Logout: () => void;
                Reauth: () => Promise<{ found: true } | { found: false, message: string }>;
            };
        };
    };
};
