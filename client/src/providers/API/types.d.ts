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

export type Post = {
    post_id: number;
    body: string;
    created_at: Date;
    times_saved: number;
    consultant_affiliate_id: number;
    saved_by_consultant: boolean;
    post_membership_affiliate_id: number;
    member_affiliate_id: number;
    fullname: string;
    username: string;
    member_is_private: boolean;
    member_followees: number;
    member_followers: number;
    board_affiliate_id: number;
    title: string;
    about: string;
    board_is_private: boolean;
    board_followers: number;
};

type MemberFromMemberPov = {
    follow_requested_by_consultant: boolean;
    is_consultant_allowed: boolean;
    consultant_member_id: number;
    username: string;
    affiliate_id: number;
    fullname: string;
    bio: string;
    birthdate: Date;
    is_private: boolean;
    followees: number;
    followers: number;
    created_at: Date;
};

type FollowRequest = {
    username: string;
    fullname: string;
    affiliate_id: number;
    follow_request_id: number;
    consultant_affiliate_id: number;
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
    namespace Posts {
        namespace SwitchSave {
            type Payload = {
                post_id: number;
            };
            type Result = {
                done: boolean;
            };
        };
        namespace Create {
            type Payload = {
                body: string;
            };
            type Result = {
                created: true;
                payload: {
                    affiliates: { affiliate_id: number }[];
                    entity_id: number;
                    post_id: number;
                };
            } | {
                created: false;
                message: string;
            };
        };
    };
    namespace Feed {
        namespace Get {
            type Result = {
                found: true;
                payload: Post[];
            } | {
                found: false;
                message: string;
            };
        };
        namespace GetSaved {
            type Result = {
                found: true;
                payload: Post[];
            } | {
                found: false;
                message: string;
            };
        };
        namespace GetFromAffiliateID {
            type Payload = {
                affiliate_id: number;
            };
            type Result = {
                found: true;
                payload: Post[];
            } | {
                found: false;
                message: string;
            };
        };
    };

    namespace Members {
        namespace GetFromMemberPovByUsername {
            type Payload = {
                username: string;
            };

            type Result = {
                found: true;
                payload: MemberFromMemberPov;
            } | {
                found: false;
                message: string;
            };
        };
    };
    namespace Followers {
        namespace GetRequests {
            type Result = {
                found: true;
                payload: FollowRequest[];
            } | {
                found: false;
                message: string;
            };
        };
        namespace AcceptRequest {
            type Payload = {
                follow_request_id: number;
            };
            type Result = {
                done: true;
            } | {
                done: false;
                message: string;
            };
        };
        namespace DeclineRequest {
            type Payload = {
                follow_request_id: number;
            };
            type Result = {
                done: true;
            } | {
                done: false;
                message: string;
            };
        };
    };

    namespace Affiliates {
        namespace Follow {
            type Payload = {
                affiliate_id: number;
            };
            type Result = {
                done: true;
                payload: { follow_request_id: number };
            } | {
                done: false;
                message: string;
            };
        };
        namespace Unfollow {
            type Payload = {
                affiliate_id: number;
            };
            type Result = {
                done: true;
            } | {
                done: false;
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
            Posts: {
                SwitchSave: (payload: APIAction.Posts.SwitchSave.Payload) => Promise<{ done: boolean }>;
                Create: (payload: APIAction.Posts.Create.Payload) => Promise<{ created: true, post: { post_id: number } } | { created: false, message: string }>;
            };
            Feed: {
                Get: () => Promise<{ found: true, posts: Post[] } | { found: false, message: string }>;
                GetSaved: () => Promise<{ found: true, posts: Post[] } | { found: false, message: string }>;
                GetFromAffiliateID: (payload: APIAction.Feed.GetFromAffiliateID.Payload) => Promise<{ found: true, posts: Post[] } | { found: false, message: string }>;
            };
            Members: {
                GetFromMemberPovByUsername: (payload: APIAction.Members.GetFromMemberPovByUsername.Payload) => Promise<{ found: true, member: MemberFromMemberPov } | { found: false, message: string }>;
            };
            Followers: {
                GetRequests: () => Promise<{ found: true, requests: FollowRequest[] } | { found: false, message: string }>;
                AcceptRequest: (payload: APIAction.Followers.AcceptRequest.Payload) => Promise<{ done: true } | { done: false, message: string }>;
                DeclineRequest: (payload: APIAction.Followers.DeclineRequest.Payload) => Promise<{ done: true } | { done: false, message: string }>;
            };
            Affiliates: {
                Follow: (payload: APIAction.Affiliates.Follow.Payload) => Promise<{ done: true, follow_request_id: number } | { done: false, message: string }>;
                Unfollow: (payload: APIAction.Affiliates.Unfollow.Payload) => Promise<{ done: true } | { done: false, message: string }>;
            };
        };
    };
};
