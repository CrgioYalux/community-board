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
