import type { PoolConnection } from 'mysql2';

import bcrypt from 'bcrypt';
import Common from './common';
import Helper from '../helper';
enum MemberOperationQuery {
    // Helpers
    CheckIfValidMemberByID = `
        SELECT
            (e.is_active = 1) AS is_active,
            e.id AS entity_id,
            a.id AS affiliate_id,
            m.id AS member_id,
            is_private,
            (md.member_id IS NOT NULL) AS has_description
        FROM entity e
        JOIN affiliate a ON e.id = a.entity_id
        JOIN member m ON a.id = m.affiliate_id
        LEFT JOIN member_description md ON m.id = md.member_id
        WHERE m.id = ?
        LIMIT 1
    `,
    CheckIfValidMemberByUsername = `
        SELECT
            e.id AS entity_id,
            a.id AS affiliate_id,
            m.id AS member_id,
            (e.is_active = 1) AS is_active,
            (md.is_private = 1) AS is_private,
            (md.member_id IS NOT NULL) AS has_description
        FROM entity e
        JOIN affiliate a ON e.id = a.entity_id
        JOIN member m ON a.id = m.affiliate_id
        LEFT JOIN member_description md ON m.id = md.member_id
        WHERE m.username = ?
        LIMIT 1
    `,
    CheckIfFollowRequestExists = `
        SELECT
            mfr.id AS follow_request_id
        FROM member_follow_request mfr
        WHERE mfr.from_member_id = ? AND mfr.to_affiliate_id = ?
    `,
    CheckIfPasswordMatch = `SELECT * FROM member_auth ma WHERE ma.member_id = ? LIMIT 1`,

    // Get
    GetAllAbbreviated = `SELECT m.affiliate_id, md.* FROM member m LEFT JOIN member_description md ON m.id = md.member_id`,
    GetByIDAbbreviated = `SELECT m.affiliate_id, md.* FROM member m LEFT JOIN member_description md ON m.id = md.member_id WHERE m.id = ?`,
    GetExtended = `SELECT * FROM member_extended`,
    GetExtendedByID = `SELECT * FROM member_extended me WHERE me.member_id = ?`,

    GetFromMemberPovByUsername = `
        SELECT 
            (mfr.id IS NOT NULL) AS follow_requested_by_consultant,
            IF(mfr.is_accepted IS NULL, (me.is_private = 0), (mfr.is_accepted = 1)) AS is_consultant_allowed,
            mfr.from_member_id AS consultant_member_id,
            me.*
        FROM member_extended me
        LEFT JOIN member_follow_request mfr ON mfr.to_affiliate_id = me.affiliate_id AND mfr.from_member_id = ?
        WHERE me.username = ? 
    `,

    // Create
    CreateMember = `INSERT INTO member (affiliate_id, username) VALUES (?, ?)`,
    CreateMemberAuth = `INSERT INTO member_auth (member_id, salt, hash) VALUES (?, ?, ?)`,
    CreateMemberDescription = `
        INSERT INTO member_description 
            (member_id, email, fullname, bio, birthdate, is_private)
        VALUES 
            (?, ?, ?, ?, ?, COALESCE(?, 0))`,

    // Follow
    Follow = `INSERT INTO member_follow_request (from_member_id, to_affiliate_id, is_accepted) VALUES (?, ?, ?)`,
    AcceptFollowRequest = `
        UPDATE 
            member_follow_request mfr
        SET mfr.is_accepted = 1
        WHERE 
            mfr.id = ? AND mfr.to_affiliate_id = ?
    `,
    DeleteFollowRequest = `
        DELETE FROM member_follow_request mfr
        WHERE mfr.from_member_id = ? AND mfr.to_affiliate_id = ?
    `,
    DeclineFollowRequest = `
        DELETE FROM member_follow_request mfr
        WHERE mfr.id = ?
    `,
    GetFollowersListed = `
        SELECT * FROM affiliate_followers_listed afl
        WHERE afl.consultant_affiliate_id = ?
    `,
    GetFolloweesListed = `
        SELECT * FROM affiliate_followees_listed afl
        WHERE afl.consultant_affiliate_id = ?
    `,
    
    // Delete is handled as entity by common controllers

    // Update 
    UpdateMemberDescription = `
        UPDATE member_description md
        SET
            md.email = COALESCE(?, md.email),
            md.fullname = COALESCE(?, md.fullname),
            md.bio = COALESCE(?, md.bio),
            md.birthdate = COALESCE(?, md.birthdate),
            md.is_private = COALESCE(?, md.is_private)
        WHERE
            md.member_id = ?
    `,
};

interface MemberOperation {
    CheckIfValidMemberByID: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Member, 'member_id'>,
        ) => Promise<SelectQueryActionReturn<MemberIdentificator & Pick<Member, 'is_active' | 'has_description' | 'is_private'>>>;
        QueryReturnType: EffectlessQueryResult<MemberIdentificator & Pick<Member, 'is_active' | 'has_description' | 'is_private'>>;
    };
    CheckIfValidMemberByUsername: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Member, 'username'>,
        ) => Promise<SelectQueryActionReturn<MemberIdentificator & Pick<Member, 'is_active' | 'has_description' | 'is_private'>>>;
        QueryReturnType: EffectlessQueryResult<MemberIdentificator & Pick<Member, 'is_active' | 'has_description' | 'is_private'>>;
    };
    CheckIfFollowRequestExists: {
        Action: (
            pool: PoolConnection,
            payload: Pick<MemberFollowRequest, 'from_member_id' | 'to_affiliate_id'>,
        ) => Promise<SelectQueryActionReturn<Pick<MemberFollowRequest, 'follow_request_id'>>>;
        QueryReturnType: EffectlessQueryResult<Pick<MemberFollowRequest, 'follow_request_id'>>;
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
            payload: MemberLogin,
        ) => Promise<SelectQueryActionReturn<MemberIdentificator>>;
        QueryReturnType: EffectlessQueryResult<MemberIdentificator>;
    };

    GetExtended: {
        Action: (
            pool: PoolConnection,
        ) => Promise<SelectQueryActionReturn<Array<MemberIdentificator & MemberDescription & Pick<Member, 'username' | 'followees' | 'followers' | 'created_at' | 'is_private'>>>>;
        QueryReturnType: EffectlessQueryResult<MemberIdentificator & MemberDescription & Pick<Member, 'username' | 'followees' | 'followers' | 'created_at' | 'is_private'>>;
    };
    GetExtendedByID: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Member, 'member_id'>,
        ) => Promise<SelectQueryActionReturn<MemberIdentificator & MemberDescription & Pick<Member, 'username' | 'followees' | 'followers' | 'created_at' | 'is_private'>>>;
        QueryReturnType: EffectlessQueryResult<MemberIdentificator & MemberDescription & Pick<Member, 'username' | 'followees' | 'followers' | 'created_at' | 'is_private'>>;
    };

    GetFromMemberPovByUsername: {
        Action: (
            pool: PoolConnection,
            payload: Pick<ViewMemberFromMemberPov, 'username' | 'consultant_member_id'>,
        ) => Promise<SelectQueryActionReturn<ViewMemberFromMemberPov>>;
        QueryReturnType: EffectlessQueryResult<ViewMemberFromMemberPov>;
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
            payload: Pick<Member, 'member_id'> & Partial<MemberDescription>,
        ) => Promise<InsertionQueryActionReturn<Pick<Member, 'member_id'>>>;
        QueryReturnType: EffectfulQueryResult;
    };
    CreateMinimalMember: {
        Action: (
            pool: PoolConnection,
            payload: MemberRegister,
        ) => Promise<InsertionQueryActionReturn<MemberIdentificator>>;
        QueryReturnType: EffectfulQueryResult;
    };
    CreateFullMember: {
        Action: (
            pool: PoolConnection,
            payload: MemberRegister & Partial<MemberDescription>,
        ) => Promise<InsertionQueryActionReturn<MemberIdentificator>>;
        QueryReturnType: EffectfulQueryResult;
    };

    Follow: {
        Action: (
            pool: PoolConnection,
            payload: Pick<MemberFollowRequest, 'from_member_id' | 'to_affiliate_id'>,
        ) => Promise<InsertionQueryActionReturn<Pick<MemberFollowRequest, 'follow_request_id'>>>;
        QueryReturnType: EffectfulQueryResult;
    };
    AcceptFollowRequest: {
        Action: (
            pool: PoolConnection,
            payload: Pick<MemberFollowRequest, 'follow_request_id' | 'to_affiliate_id'>,
        ) => Promise<InsertionQueryActionReturn<Pick<MemberFollowRequest, 'follow_request_id' | 'is_accepted'>>>;
        QueryReturnType: EffectfulQueryResult;
    };
    DeleteFollowRequest: {
        Action: (
            pool: PoolConnection,
            payload: Pick<MemberFollowRequest, 'from_member_id' | 'to_affiliate_id'>,
        ) => Promise<DeleteQueryActionReturn>;
        QueryReturnType: EffectfulQueryResult;
    };
    DeclineFollowRequest: {
        Action: (
            pool: PoolConnection,
            payload: Pick<MemberFollowRequest, 'follow_request_id'>,
        ) => Promise<DeleteQueryActionReturn>;
        QueryReturnType: EffectfulQueryResult;
    };
    GetFollowersListed: {
        Action: (
            pool: PoolConnection,
            payload: Pick<ViewAffiliateFollowRequests, 'consultant_affiliate_id'>,
        ) => Promise<SelectQueryActionReturn<Array<ViewAffiliateFollowRequests>>>;
        QueryReturnType: EffectlessQueryResult<ViewAffiliateFollowRequests>;
    };
    GetFolloweesListed: {
        Action: (
            pool: PoolConnection,
            payload: Pick<ViewAffiliateFollowRequests, 'consultant_affiliate_id'>,
        ) => Promise<SelectQueryActionReturn<Array<ViewAffiliateFollowRequests>>>;
        QueryReturnType: EffectlessQueryResult<ViewAffiliateFollowRequests>;
    };

    UpdateMemberDescription: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Member, 'member_id'> & Partial<MemberDescription>,
        ) => Promise<UpdateQueryActionReturn>;
        QueryReturnType: EffectfulQueryResult;
    };
};

const CheckIfValidMemberByID: MemberOperation['CheckIfValidMemberByID']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(MemberOperationQuery.CheckIfValidMemberByID, [payload.member_id], (err, results) => {
            if (err) {
                reject({ checkIfValidMemberByIDError: err });
                return;
            }

            const parsed = results as MemberOperation['CheckIfValidMemberByID']['QueryReturnType'];

            if (!parsed.length) {
                resolve({ found: false, message: 'The member does not exist' });
                return;
            }

            resolve({ found: true, payload: parsed[0] });
        });
    });
};

const CheckIfValidMemberByUsername: MemberOperation['CheckIfValidMemberByUsername']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(MemberOperationQuery.CheckIfValidMemberByUsername, [payload.username], (err, results) => {
            if (err) {
                reject({ checkIfValidMemberByUsernameError: err });
                return;
            }

            const parsed = results as MemberOperation['CheckIfValidMemberByUsername']['QueryReturnType'];

            if (!parsed.length) {
                resolve({ found: false, message: 'The member does not exist' });
                return;
            }

            resolve({ found: true, payload: parsed[0] });
        });
    });
};

const CheckIfFollowRequestExists: MemberOperation['CheckIfFollowRequestExists']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(MemberOperationQuery.CheckIfFollowRequestExists, [payload.from_member_id, payload.to_affiliate_id], (err, results) => {
            if (err) {
                reject({ checkIfFollowRequestExistsError: err });
                return;
            }

            const parsed = results as MemberOperation['CheckIfFollowRequestExists']['QueryReturnType'];
            
            if (!parsed.length) {
                resolve({ found: false, message: 'No follow request found' });
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

            CheckIfValidMemberByUsername(pool, { username: payload.username })
            .then((res1) => {
                if (!res1.found) {
                    resolve({ found: false, message: 'Could not find a member with that username' });
                    return;
                }

                if (!res1.payload.is_active) {
                    resolve({ found: false, message: 'Member is deleted' });
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

const GetExtended: MemberOperation['GetExtended']['Action'] = (pool) => {
    return new Promise((resolve, reject) => {
        pool.query(MemberOperationQuery.GetExtended, (err, results) => {
            if (err) {
                reject({ getAllExtendedError: err });
                return;
            }

            const parsed = results as MemberOperation['GetExtended']['QueryReturnType'];

            if (!parsed.length) {
                resolve({ found: false, message: 'No members found' });
                return;
            }

            resolve({ found: true, payload: parsed });
        });
    });
};

const GetExtendedByID: MemberOperation['GetExtendedByID']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(MemberOperationQuery.GetExtendedByID, [payload.member_id], (err, results) => {
            if (err) {
                reject({ getAllExtendedError: err });
                return;
            }

            const parsed = results as MemberOperation['GetExtendedByID']['QueryReturnType'];

            if (!parsed.length) {
                resolve({ found: false, message: 'No member found with that ID' });
                return;
            }

            resolve({ found: true, payload: parsed[0] });
        });
    });
};

const GetFromMemberPovByUsername: MemberOperation['GetFromMemberPovByUsername']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(MemberOperationQuery.GetFromMemberPovByUsername, [payload.consultant_member_id, payload.username], (err, results) => {
            if (err) {
                reject({ getAllExtendedError: err });
                return;
            }

            const parsed = results as MemberOperation['GetFromMemberPovByUsername']['QueryReturnType'];

            if (!parsed.length) {
                resolve({ found: false, message: 'No member found with that username' });
                return;
            }

            resolve({ found: true, payload: parsed[0] });
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
        pool.beginTransaction((err0) => {
            if (err0) {
                reject({ createMemberDescriptionBeginTransactionError: err0 });
                return;
            }

            CheckIfValidMemberByID(pool, { member_id: payload.member_id })
            .then((res1) => {
                if (!res1.found) {
                    pool.rollback(() => {
                        resolve({ done: false, message: res1.message });
                    });
                    return;
                }

                if (!res1.payload.is_active) {
                    pool.rollback(() => {
                        resolve({ done: false, message: 'Member is deleted' });
                    });
                    return;
                }

                if (res1.payload.has_description) {
                    pool.rollback(() => {
                        resolve({ done: false, message: 'Member already has a description' });
                    });
                    return;
                }

                const values = [
                    payload.member_id,
                    payload.email ?? null,
                    payload.fullname ?? null,
                    payload.bio ?? null,
                    payload.birthdate ?? null,
                    payload.is_private ?? null
                ];

                pool.query(MemberOperationQuery.CreateMemberDescription, values, (err2, results) => {
                    if (err2) {
                        pool.rollback(() => {
                            reject({ createMemberDescriptionError: err2 });
                        });
                        return;
                    }

                    const parsed = results as MemberOperation['CreateMemberDescription']['QueryReturnType'];

                    if (!parsed.affectedRows) {
                        pool.rollback(() => {
                            resolve({ done: false, message: 'Could not create the member description' });
                        });
                        return;
                    }

                    pool.commit((err3) => {
                        if (err3) {
                            pool.rollback(() => {
                                reject({ createMemberDescriptionCommitTransactionError: err3 });
                            });
                            return;
                        }

                        resolve({ done: true, payload: { member_id: payload.member_id } });
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

const CreateMinimalMember: MemberOperation['CreateMinimalMember']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.beginTransaction((err0) => {
            if (err0) {
                reject({ createMinimalMemberBeginTransactionError: err0 });
                return;
            }

            CheckIfValidMemberByUsername(pool, { username: payload.username })
            .then((res1) => {
                if (res1.found) {
                    pool.rollback(() => {
                        resolve({ done: false, message: 'Username is already used' });
                    });
                    return;
                }

                Common.CreateEntity(pool)
                .then((res2) => {
                    if (!res2.done) {
                        pool.rollback(() => {
                            resolve(res2);
                        });
                        return;
                    }
                    
                    Common.CreateAffiliate(pool, { entity_id: res2.payload.entity_id })
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
                                        });
                                        return;
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

            CheckIfValidMemberByUsername(pool, { username: payload.username })
            .then((res1) => {
                if (res1.found) {
                    pool.rollback(() => {
                        resolve({ done: false, message: 'Username is already used' });
                    });
                    return;
                }

                Common.CreateEntity(pool)
                .then((res2) => {
                    if (!res2.done) {
                        pool.rollback(() => {
                            resolve(res2);
                        });
                        return;
                    }
                    
                    Common.CreateAffiliate(pool, { entity_id: res2.payload.entity_id })
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
                                            });
                                            return;
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

const Follow: MemberOperation['Follow']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.beginTransaction((err0) => {
            if (err0) {
                reject({ followBeginTransactionError: err0 });
                return;
            }

            CheckIfValidMemberByID(pool, { member_id: payload.from_member_id })
            .then((res1) => {
                if (!res1.found) {
                    pool.rollback(() => {
                        resolve({ done: false, message: res1.message });
                    });
                    return;
                }

                if (!res1.payload.has_description) {
                    resolve({ done: false, message: 'The follower member is not valid' });
                    return;
                }

                if (!res1.payload.is_active) {
                    resolve({ done: false, message: 'The follower member is deleted' });
                    return;
                }

                Common.CheckIfValidAffiliateByID(pool, { affiliate_id: payload.to_affiliate_id })
                .then((res2) => {
                    if (!res2.found) {
                        pool.rollback(() => {
                            resolve({ done: false, message: res2.message });
                        });
                        return;
                    }

                    if (res1.payload.entity_id === res2.payload.entity_id) {
                        resolve({ done: false, message: 'The follower and followee members can not be the same' });
                        return;
                    }

                    if (!res2.payload.has_description && res2.payload.is_member) {
                        resolve({ done: false, message: 'The followee member is not valid' });
                        return;
                    }

                    if (!res2.payload.has_description && res2.payload.is_board) {
                        resolve({ done: false, message: 'The followee board is not valid' });
                        return;
                    }

                    if (!res2.payload.is_active && res2.payload.is_member) {
                        resolve({ done: false, message: 'The followee member is deleted' });
                        return;
                    }
                    
                    if (!res2.payload.is_active && res2.payload.is_board) {
                        resolve({ done: false, message: 'The followee board is deleted' });
                        return;
                    }

                    CheckIfFollowRequestExists(pool, { from_member_id: res1.payload.member_id, to_affiliate_id: res2.payload.affiliate_id })
                    .then((res3) => {
                        if (res3.found) {
                            resolve({ done: false, message: 'There\'s is already a follow request created' });
                            return;
                        }

                        const values = [
                            res1.payload.member_id,
                            res2.payload.affiliate_id,
                            res2.payload.is_private ? 0 : 1,
                        ];

                        pool.query(MemberOperationQuery.Follow, values, (err4, results) => {
                            if (err4) {
                                pool.rollback(() => {
                                    reject({ followError: err4 });
                                });
                                return;
                            }

                            const parsed = results as MemberOperation['Follow']['QueryReturnType'];

                            if (!parsed.affectedRows) {
                                pool.rollback(() => {
                                    resolve({ done: false, message: 'Could not follow the affiliate' });
                                });
                                return;
                            }

                            pool.commit((err5) => {
                                if (err5) {
                                    pool.rollback(() => {
                                        reject({ followCommitTransactionError: err5 });
                                    });
                                    return;
                                }

                                resolve({ done: true, payload: { follow_request_id: parsed.insertId } });
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

const AcceptFollowRequest: MemberOperation['AcceptFollowRequest']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(MemberOperationQuery.AcceptFollowRequest, [payload.follow_request_id, payload.to_affiliate_id], (err, results) => {
            if (err) {
                reject({ acceptFollowError: err });
                return;
            }

            const parsed = results as MemberOperation['AcceptFollowRequest']['QueryReturnType'];

            if (!parsed.changedRows) {
                resolve({ done: false, message: 'Could not accept the follow request' });
                return;
            }

            resolve({ done: true, payload: { follow_request_id: payload.follow_request_id, is_accepted: true } });
        });
    });
};

const DeleteFollowRequest: MemberOperation['DeleteFollowRequest']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(MemberOperationQuery.DeleteFollowRequest, [payload.from_member_id, payload.to_affiliate_id], (err, results) => {
            if (err) {
                reject({ acceptFollowError: err });
                return;
            }

            const parsed = results as MemberOperation['DeleteFollowRequest']['QueryReturnType'];

            if (!parsed.affectedRows) {
                resolve({ done: false, message: 'Could not delete the follow request' });
                return;
            }

            resolve({ done: true });
        });
    });
};

const DeclineFollowRequest: MemberOperation['DeclineFollowRequest']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(MemberOperationQuery.DeclineFollowRequest, [payload.follow_request_id], (err, results) => {
            if (err) {
                reject({ acceptFollowError: err });
                return;
            }

            const parsed = results as MemberOperation['DeclineFollowRequest']['QueryReturnType'];

            if (!parsed.affectedRows) {
                resolve({ done: false, message: 'Could not decline the follow request' });
                return;
            }

            resolve({ done: true });
        });
    });
};

const GetFollowersListed: MemberOperation['GetFollowersListed']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(MemberOperationQuery.GetFollowersListed, [payload.consultant_affiliate_id], (err, results) => {
            if (err) {
                reject({ getFollowRequestsError: err });
                return;
            }

            const parsed = results as MemberOperation['GetFollowersListed']['QueryReturnType'];

            if (!parsed.length) {
                resolve({ found: false, message: 'No followers found' });
                return;
            }

            resolve({ found: true, payload: parsed });
        });
    });
};

const GetFolloweesListed: MemberOperation['GetFolloweesListed']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(MemberOperationQuery.GetFolloweesListed, [payload.consultant_affiliate_id], (err, results) => {
            if (err) {
                reject({ getFollowRequestsError: err });
                return;
            }

            const parsed = results as MemberOperation['GetFolloweesListed']['QueryReturnType'];

            if (!parsed.length) {
                resolve({ found: false, message: 'No followees found' });
                return;
            }

            resolve({ found: true, payload: parsed });
        });
    });
};

const UpdateMemberDescription: MemberOperation['UpdateMemberDescription']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.beginTransaction((err0) => {
            if (err0) {
                reject({ updateMemberDescriptionBeginTransactionError: err0 });
                return;
            }

            CheckIfValidMemberByID(pool, { member_id: payload.member_id })
            .then((res1) => {
                if (!res1.found) {
                    pool.rollback(() => {
                        resolve({ done: false, message: res1.message });
                    });
                    return;
                }

                if (!res1.payload.is_active) {
                    pool.rollback(() => {
                        resolve({ done: false, message: 'Member is deleted' });
                    });
                    return;
                }

                const values = [
                    payload.email ?? null,
                    payload.fullname ?? null,
                    payload.bio ?? null,
                    payload.birthdate ?? null,
                    payload.is_private ?? null,
                    payload.member_id
                ];

                pool.query(MemberOperationQuery.UpdateMemberDescription, values, (err2, results) => {
                    if (err2) {
                        pool.rollback(() => {
                            reject({ updateMemberDescriptionError: err2 });
                        });
                        return;
                    }

                    const parsed = results as MemberOperation['UpdateMemberDescription']['QueryReturnType'];

                    if (!parsed.changedRows) {
                        pool.rollback(() => {
                            resolve({ done: false, message: 'Could not update the member description' });
                        });
                        return;
                    }

                    pool.commit((err3) => {
                        if (err3) {
                            pool.rollback(() => {
                                reject({ updateMemberDescriptionCommitTransactionError: err3 });
                            });
                            return;
                        }

                        resolve({ done: true });
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
    GetExtended,
    GetExtendedByID,
    GetFromMemberPovByUsername,
    CreateMinimalMember,
    CreateMemberDescription,
    CreateFullMember,
    Follow,
    AcceptFollowRequest,
    DeleteFollowRequest,
    DeclineFollowRequest,
    GetFollowersListed,
    GetFolloweesListed,
    UpdateMemberDescription,
};

export default Members;
