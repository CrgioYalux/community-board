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
    is_private: boolean;
};

type Member = Affiliate & MemberAuth & MemberDescription & {
    member_id: number;
    username: string;
    has_description: boolean;
};

type MemberRegister = Pick<Member, 'username' | 'password'>;
type MemberLogin = Pick<Member, 'username' | 'password'>;
type MemberIdentificator = Pick<Member, 'entity_id' | 'affiliate_id' | 'member_id'>;

type Post = Entity & {
    post_id: number;
    body: string;
    from_affiliate_id: number;
};

type PostIdentificator = Pick<Post, 'entity_id' | 'post_id'>;
