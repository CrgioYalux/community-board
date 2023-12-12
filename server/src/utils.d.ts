// API Types

type Session = Pick<Member, 'member_id' | 'username'> & {
    expiresIn: string,
};

// SQL Types

type EffectfulQueryResult = {
    fieldCount: number;
    affectedRows: number;
    insertId: number;
    serverStatus: number;
    warningCount: number;
    message: string;
    protocol41: boolean;
    changedRows: number;
};

type EffectlessQueryResult<T> = T[];

type InsertionQueryActionReturn<T> = { done: true, payload: T } | { done: false, message: string };
type SelectQueryActionReturn<T> = { found: true, payload: T } | { found: false, message: string };
type DeleteQueryActionReturn = { done: true } | { done: false, message: string };
type UpdateQueryActionReturn = { done: true } | { done: false, message: string };

// Database Tables : Development Types

type Entity = {
    entity_id: number;
    is_active: boolean;
    created_at: Date;
};

type Affiliate = Entity & {
    affiliate_id: number;
    is_member: boolean;
    is_board: boolean;
    followers: number;
};

type MemberAuth = {
    password: string;
    salt: string;
    hash: string;
};

type MemberDescription = {
    email: string;
    fullname: string;
    bio: string;
    birthdate: Date;
    is_private: boolean | null;
};

type Member = Affiliate & MemberAuth & MemberDescription & {
    member_id: number;
    username: string;
    has_description: boolean;
    followees: number;
};

type MemberRegister = Pick<Member, 'username' | 'password'>;
type MemberLogin = Pick<Member, 'username' | 'password'>;
type MemberIdentificator = Pick<Member, 'entity_id' | 'affiliate_id' | 'member_id'>;

type MemberFollowRequest = {
    member_follow_request_id: number;
    from_member_id: number;
    to_affiliate_id: number;
    is_accepted: boolean;
};

type AffiliateFollowRequest = {
    member_follow_request_id: number;
    followee_affiliate_id: number;
    follower_member_id: number;
    follower_username: string;
};

type Post = Entity & {
    post_id: number;
    body: string;
    affiliate_id: number;
};

type PostIdentificator = Pick<Post, 'entity_id' | 'post_id'>;

type Board = Affiliate & {
    board_id: number;
    from_member_id: numer;
    title: string;
    about: string;
    is_private: boolean;
};

// VIEWS 

type ViewAffiliatePosts = {
    post_id: number;
    body: string;
    created_at: Date;
    times_saved: number;
    consultant_affiliate_id: number;
    saved_by_consultant: boolean;
    post_membership_affiliate_id: number;
    member_id: number;
    member_affiliate_id: number;
    fullname: string;
    username: string;
    member_is_private: boolean;
    member_followees: number;
    member_followers: number;
    board_id: number;
    board_affiliate_id: number;
    title: string;
    about: string;
    board_is_private: boolean;
    board_followers: number;
};

