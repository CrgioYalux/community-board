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

type Member = Affiliate & {
    member_id: number;
    email: string;
    username: string;
    fullname: string;
    bio: string;
    birthdate: Date;
    is_private: boolean;
    password: string;
    salt: string;
    hash: string;
    has_description: boolean;
};
