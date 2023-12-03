import type { PoolConnection } from 'mysql';

import bcrypt from 'bcrypt';

import Helper from '../helper';

enum MemberOperationQuery {
    // Helpers
    CheckIfUsernameMatch = `
        SELECT 
            e.id AS entity_id,
            a.id AS affiliate_id,
            m.id AS member_id
        FROM entity e
        JOIN affiliate a ON e.id = a.entity_id
        JOIN member m ON a.id = m.affiliate_id
        WHERE m.username = ? LIMIT 1
    `,
    CheckIfPasswordMatch = `SELECT * FROM member_auth ma WHERE ma.member_id = ? LIMIT 1`,

    // Get
    GetAllAbbreviated = `SELECT m.affiliate_id, md.* FROM member m LEFT JOIN member_description md ON m.id = md.member_id`,
    GetByIDAbbreviated = `SELECT m.affiliate_id, md.* FROM member m LEFT JOIN member_description md ON m.id = md.member_id WHERE m.id = ?`,
    GetAllExtended = ``,
    GetByIDExtended = ``,

    // Create
    CreateEntity = `INSERT INTO entity VALUES ()`,
    CreateAffiliate = `INSERT INTO affiliate (entity_id) VALUES (?)`,
    CreateMember = `INSERT INTO member (affiliate_id, username) VALUES (?, ?)`,
    CreateMemberAuth = `INSERT INTO member_auth (member_id, salt, hash) VALUES (?, ?, ?)`,
    CreateMemberDescription = `INSERT INTO member_description (member_id, email, fullname, bio, birthdate, is_private) VALUES (?, ?, ?, ?, ?, IF(? IS NULL, 0, ?))`,

    // Follow
    
    // Unfollow
    
    // Delete
    DeleteEntity = `UPDATE entity e SET e.is_active = 0 WHERE i.id = ?`,

    // Update 
};

type InsertionQueryActionReturn<T> = { done: true, payload: T } | { done: false, message: string };
type SelectQueryActionReturn<T> = { found: true, payload: T } | { found: false, message: string };
type DeleteQueryActionReturn = { done: true } | { found: false, message: string };
type UpdateQueryActionReturn = { done: true } | { done: false, message: string };

interface MemberOperation {
    CheckIfUsernameMatch: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Member, 'username'>,
        ) => Promise<SelectQueryActionReturn<Pick<Member, 'entity_id' | 'affiliate_id' | 'member_id'>>>;
        QueryReturnType: EffectlessQueryResult<Pick<Member, 'entity_id' | 'affiliate_id' | 'member_id'>>;
    };
    CheckIfPasswordMatch: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Member, 'member_id' | 'password'>,
        ) => Promise<SelectQueryActionReturn<Pick<Member, 'member_id'>>>;
        QueryReturnType: EffectlessQueryResult<Pick<Member, 'member_id' | 'salt' | 'hash'>>;
    };
    CheckIfCredentialsMatch: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Member, 'username' | 'password'>,
        ) => Promise<SelectQueryActionReturn<Pick<Member, 'entity_id' | 'affiliate_id' | 'member_id'>>>;
        QueryReturnType: EffectlessQueryResult<Pick<Member, 'entity_id' | 'affiliate_id' | 'member_id'>>;
    };

    CreateEntity: {
        Action: (
            pool: PoolConnection,
        ) => Promise<InsertionQueryActionReturn<Pick<Entity, 'entity_id'>>>;
        QueryReturnType: EffectfulQueryResult;
    };
    CreateAffiliate: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Affiliate, 'entity_id'>,
        ) => Promise<InsertionQueryActionReturn<Pick<Affiliate, 'affiliate_id'>>>;
        QueryReturnType: EffectfulQueryResult;
    };
    CreateMember: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Member, 'affiliate_id' | 'username'>,
        ) => Promise<InsertionQueryActionReturn<Pick<Member, 'member_id'>>>;
        QueryReturnType: EffectfulQueryResult;
    };
    CreateMemberAuth: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Member, 'member_id' | 'password'>,
        ) => Promise<InsertionQueryActionReturn<Pick<Member, 'member_id'>>>;
        QueryReturnType: EffectfulQueryResult;
    };
    CreateMemberDescription: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Member, 'member_id'> & Partial<Pick<Member, 'email' | 'fullname' | 'bio' | 'birthdate' | 'is_private'>>,
        ) => Promise<InsertionQueryActionReturn<Pick<Member, 'member_id'>>>;
        QueryReturnType: EffectfulQueryResult;
    };
    CreateMinimalMember: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Member, 'username' | 'password'>,
        ) => Promise<InsertionQueryActionReturn<Pick<Member, 'member_id' | 'affiliate_id' | 'entity_id'>>>;
        QueryReturnType: EffectfulQueryResult;
    };
    CreateFullMember: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Member, 'username' | 'password'> & Partial<Pick<Member, 'email' | 'fullname' | 'bio' | 'birthdate' | 'is_private'>>,
        ) => Promise<InsertionQueryActionReturn<Pick<Member, 'member_id' | 'affiliate_id' | 'entity_id'>>>;
        QueryReturnType: EffectfulQueryResult;
    };
};

const CheckIfUsernameMatch: MemberOperation['CheckIfUsernameMatch']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(MemberOperationQuery.CheckIfUsernameMatch, [payload.username], (err, results) => {
            if (err) {
                reject({ checkIfUsernameMatchError: err });
                return;
            }

            const parsed = results as MemberOperation['CheckIfUsernameMatch']['QueryReturnType'];

            if (!parsed.length) {
                resolve({ found: false, message: 'Username is available' });
                return;
            }

            resolve({ found: true, payload: parsed[0] });
        });
    });
};

const CheckIfPasswordMatch: MemberOperation['CheckIfPasswordMatch']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(MemberOperationQuery.CheckIfPasswordMatch, [payload.member_id], (err0, results) => {
            if (err0) {
                reject({ checkIfPasswordMatchError: err0 });
                return;
            }

            const parsed = results as MemberOperation['CheckIfPasswordMatch']['QueryReturnType'];

            if (!parsed.length) {
                resolve({ found: false, message: 'Could not find a member with that ID' });
                return;
            }

            bcrypt.compare(payload.password.concat(parsed[0].salt), parsed[0].hash, (err1, match) => {
                if (err1) {
                    reject({ checkIfPasswordMatchError: err1 });
                    return;
                }

                if (!match) {
                    resolve({ found: false, message: 'Could not authenticate because the credentials are wrong' });
                    return;
                }
            
                resolve({ found: true, payload: { member_id: payload.member_id }});
            });
        });
    });
};

const CheckIfCredentialsMatch: MemberOperation['CheckIfCredentialsMatch']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.beginTransaction((err0) => {
            if (err0) {
                reject({ checkIfCredentialsMatchBeginTransactionError: err0 });
                return;
            }

            CheckIfUsernameMatch(pool, { username: payload.username })
            .then((res1) => {
                if (!res1.found) {
                    resolve({ found: false, message: 'Could not find a member with that username' });
                    return;
                }

                CheckIfPasswordMatch(pool, { member_id: res1.payload.member_id, password: payload.password })
                .then((res2) => {
                    if (!res2.found) {
                        resolve(res2);
                        return;
                    }
                  
                    resolve({ found: true, payload: res1.payload });
                })
                .catch((err2) => {
                    pool.rollback(() => {
                        reject({ checkIfPasswordMatchError: err2 });
                    });
                });
            })
            .catch((err1) => {
                pool.rollback(() => {
                    reject({ checkIfUsernameMatchError: err1 });
                });
            });
        });
    });
};

const CreateEntity: MemberOperation['CreateEntity']['Action'] = (pool) => {
    return new Promise((resolve, reject) => {
        pool.query(MemberOperationQuery.CreateEntity, (err, results) => {
            if (err) {
                reject({ createEntityError: err });
                return;
            }

            const parsed = results as MemberOperation['CreateEntity']['QueryReturnType'];

            if (!parsed.affectedRows) {
                resolve({ done: false, message: 'Could not create the entity' });
                return;
            }

            resolve({ done: true, payload: { entity_id: parsed.insertId } });
        });
    });
};

const CreateAffiliate: MemberOperation['CreateAffiliate']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(MemberOperationQuery.CreateAffiliate, [payload.entity_id], (err, results) => {
            if (err) {
                reject({ createAffiliateError: err });
                return;
            }

            const parsed = results as MemberOperation['CreateAffiliate']['QueryReturnType'];

            if (!parsed.affectedRows) {
                resolve({ done: false, message: 'Could not create the affiliate' });
                return;
            }

            resolve({ done: true, payload: { affiliate_id: parsed.insertId } });
        });
    });
};

const CreateMember: MemberOperation['CreateMember']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(MemberOperationQuery.CreateMember, [payload.affiliate_id, payload.username], (err, results) => {
            if (err) {
                reject({ createMemberError: err });
                return;
            }

            const parsed = results as MemberOperation['CreateMember']['QueryReturnType'];

            if (!parsed.affectedRows) {
                resolve({ done: false, message: 'Could not create the member' });
                return;
            }

            resolve({ done: true, payload: { member_id: parsed.insertId } });
        });
    });
};

const CreateMemberAuth: MemberOperation['CreateMemberAuth']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        const salt = Helper.generateSalt(100);
        
        bcrypt.hash(payload.password.concat(salt), 10, (err0, hash) => {
            if (err0) {
                reject({ hashingPasswordError: err0 });
                return;
            }

            pool.query(MemberOperationQuery.CreateMemberAuth, [payload.member_id, salt, hash], (err1, results) => {
                if (err1) {
                    reject({ createMemberAuthError: err1 });
                    return;
                }

                const parsed = results as MemberOperation['CreateMemberAuth']['QueryReturnType'];

                if (!parsed.affectedRows) {
                    resolve({ done: false, message: 'Could not create the member auth' });
                    return;
                }

                resolve({ done: true, payload: { member_id: payload.member_id } });
            });
        });
    });
};

const CreateMemberDescription: MemberOperation['CreateMemberDescription']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(MemberOperationQuery.CreateMemberDescription, [payload.member_id, payload.email ?? null, payload.fullname ?? null, payload.bio ?? null, payload.birthdate ?? null, payload.is_private ?? null, payload.is_private], (err, results) => {
            if (err) {
                reject({ createMemberDescriptionError: err });
                return;
            }
            
            const parsed = results as MemberOperation['CreateMemberDescription']['QueryReturnType'];

            if (!parsed.affectedRows) {
                resolve({ done: false, message: 'Could not create the member description' });
                return;
            }

            resolve({ done: true, payload: { member_id: payload.member_id } });
        });
    });
};

const CreateMinimalMember: MemberOperation['CreateMinimalMember']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.beginTransaction((err0) => {
            if (err0) {
                reject({ createMinimalMemberBeginTransactionError: err0 });
                return;
            }

            CheckIfUsernameMatch(pool, { username: payload.username })
            .then((res1) => {
                if (res1.found) {
                    pool.rollback(() => {
                        resolve({ done: false, message: 'Username is already used' });
                    });
                    return;
                }

                CreateEntity(pool)
                .then((res2) => {
                    if (!res2.done) {
                        pool.rollback(() => {
                            resolve(res2);
                        });
                        return;
                    }
                    
                    CreateAffiliate(pool, { entity_id: res2.payload.entity_id })
                    .then((res3) => {
                        if (!res3.done) {
                            pool.rollback(() => {
                                resolve(res3);
                            });
                            return;
                        }

                        CreateMember(pool, { affiliate_id: res3.payload.affiliate_id, username: payload.username })
                        .then((res4) => {
                            if (!res4.done) {
                                pool.rollback(() => {
                                    resolve(res4);
                                });
                                return;
                            }
                            
                            CreateMemberAuth(pool, { member_id: res4.payload.member_id, password: payload.password })
                            .then((res5) => {
                                if (!res5.done) {
                                    pool.rollback(() => {
                                        resolve(res5);
                                    });
                                    return;
                                }

                                pool.commit((err6) => {
                                    if (err6) {
                                        pool.rollback(() => {
                                            reject({ createMinimalMemberCommitTransactionError: err6 });
                                            return;
                                        });
                                    }

                                    resolve({ done: true, payload: { entity_id: res2.payload.entity_id, affiliate_id: res3.payload.affiliate_id, member_id: res4.payload.member_id } });
                                });
                            })
                            .catch((err5) => {
                                pool.rollback(() => {
                                    reject(err5);
                                });
                            });
                        })
                        .catch((err4) => {
                            pool.rollback(() => {
                                reject(err4);
                            });
                        });
                    })
                    .catch((err3) => {
                        pool.rollback(() => {
                            reject(err3);
                        });
                    });
                })
                .catch((err2) => {
                    pool.rollback(() => {
                        reject(err2);
                    });
                });
            })
            .catch((err1) => {
                pool.rollback(() => {
                    reject(err1);
                });
            });
        });
    });
};

const CreateFullMember: MemberOperation['CreateFullMember']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.beginTransaction((err0) => {
            if (err0) {
                reject({ createMinimalMemberBeginTransactionError: err0 });
                return;
            }

            CheckIfUsernameMatch(pool, { username: payload.username })
            .then((res1) => {
                if (res1.found) {
                    pool.rollback(() => {
                        resolve({ done: false, message: 'Username is already used' });
                    });
                    return;
                }

                CreateEntity(pool)
                .then((res2) => {
                    if (!res2.done) {
                        pool.rollback(() => {
                            resolve(res2);
                        });
                        return;
                    }
                    
                    CreateAffiliate(pool, { entity_id: res2.payload.entity_id })
                    .then((res3) => {
                        if (!res3.done) {
                            pool.rollback(() => {
                                resolve(res3);
                            });
                            return;
                        }

                        CreateMember(pool, { affiliate_id: res3.payload.affiliate_id, username: payload.username })
                        .then((res4) => {
                            if (!res4.done) {
                                pool.rollback(() => {
                                    resolve(res4);
                                });
                                return;
                            }
                            
                            CreateMemberAuth(pool, { member_id: res4.payload.member_id, password: payload.password })
                            .then((res5) => {
                                if (!res5.done) {
                                    pool.rollback(() => {
                                        resolve(res5);
                                    });
                                    return;
                                }
                                
                                const { username, password, ...description } = payload;
                                CreateMemberDescription(pool, { member_id: res4.payload.member_id, ...description })
                                .then((res6) => {
                                    if (!res6.done) {
                                        pool.rollback(() => {
                                            reject(res6);
                                        });
                                        return;
                                    }

                                    pool.commit((err7) => {
                                        if (err7) {
                                            pool.rollback(() => {
                                                reject({ createMinimalMemberCommitTransactionError: err7 });
                                                return;
                                            });
                                        }

                                        resolve({ done: true, payload: { entity_id: res2.payload.entity_id, affiliate_id: res3.payload.affiliate_id, member_id: res4.payload.member_id } });
                                    });
                                })
                                .catch((err6) => {
                                    pool.rollback(() => {
                                        reject(err6);
                                    });
                                });
                            })
                            .catch((err5) => {
                                pool.rollback(() => {
                                    reject(err5);
                                });
                            });
                        })
                        .catch((err4) => {
                            pool.rollback(() => {
                                reject(err4);
                            });
                        });
                    })
                    .catch((err3) => {
                        pool.rollback(() => {
                            reject(err3);
                        });
                    });
                })
                .catch((err2) => {
                    pool.rollback(() => {
                        reject(err2);
                    });
                });
            })
            .catch((err1) => {
                pool.rollback(() => {
                    reject(err1);
                });
            });
        });
    });
};

const Members = {
    CheckIfCredentialsMatch,
    CreateMinimalMember,
    CreateMemberDescription,
    CreateFullMember,
};

export default Members;
