import type { PoolConnection } from 'mysql2';
import Common from './common';

enum PostOperationQuery {
    CheckIfPostExists = `SELECT * FROM post p WHERE p.id = ?`,

    CreatePost = `INSERT INTO post (entity_id, body) VALUES (?, ?)`,
    CreatePostMembership = `INSERT INTO post_membership (post_id, affiliate_id) VALUES ?`,

    Get = `
        SELECT 
            ps.affiliate_id AS consultant_affiliate_id,
            (ps.affiliate_id IS NOT NULL) AS saved_by_consultant,
            f.*
        FROM feed f
        LEFT JOIN post_saved ps ON ps.post_id = f.post_id AND ps.affiliate_id = ?
        ORDER BY f.created_at DESC
    `,
    GetFromAffiliateID = `
        SELECT 
            ps.affiliate_id AS consultant_affiliate_id,
            (ps.affiliate_id IS NOT NULL) AS saved_by_consultant,
            f.*
        FROM feed f
        LEFT JOIN post_saved ps ON ps.post_id = f.post_id AND ps.affiliate_id = ?
        WHERE (f.post_membership_affiliate_id = ?)
        ORDER BY f.created_at DESC
    `,
    GetSaved = `
        SELECT
            *
        FROM
            affiliate_saved_posts afp
        WHERE
            (afp.consultant_affiliate_id = ?)
    `,

    DeletePost = `
        UPDATE entity e
        SET e.is_active = 0
        WHERE e.id = (
            SELECT p.entity_id
            FROM post p
            JOIN post_membership pm ON p.id = pm.post_id
            WHERE p.id = ? AND pm.affiliate_id = ?
            LIMIT 1
        )
    `,

    SavePost = `INSERT INTO post_saved (post_id, affiliate_id) VALUES (?, ?)`,
    UnsavePost = `DELETE FROM post_saved ps WHERE ps.post_id = ? AND ps.affiliate_id = ?`,
};

interface PostOperation {
    CheckIfPostExists: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Post, 'post_id'>,
        ) => Promise<SelectQueryActionReturn<Pick<Post, 'post_id'>>>;
        QueryReturnType: EffectlessQueryResult<Pick<Post, 'post_id'>>;
    };

    CreatePost: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Post, 'entity_id' | 'body'>,
        ) => Promise<InsertionQueryActionReturn<Pick<Post, 'post_id'>>>;
        QueryReturnType: EffectfulQueryResult;
    };
    CreatePostMembership: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Post, 'post_id'> & { affiliates: Array<Pick<Post, 'affiliate_id'>> },
        ) => Promise<InsertionQueryActionReturn<Pick<Post, 'post_id'> & { affiliates: Array<Pick<Post, 'affiliate_id'>> }>>;
        QueryReturnType: EffectfulQueryResult;
    };
    Create: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Post, 'body'> & { affiliates: Array<Pick<Post, 'affiliate_id'>> },
        ) => Promise<InsertionQueryActionReturn<PostIdentificator & { affiliates: Array<Pick<Post, 'affiliate_id'>> }>>;
    };

    Get: {
        Action: (
            pool: PoolConnection,
            payload: Pick<ViewAffiliatePosts, 'consultant_affiliate_id'>,
        ) => Promise<SelectQueryActionReturn<Array<ViewAffiliatePosts>>>;
        QueryReturnType: EffectlessQueryResult<ViewAffiliatePosts>;
    };
    GetFromAffiliateID: {
        Action: (
            pool: PoolConnection,
            payload: Pick<ViewAffiliatePosts, 'consultant_affiliate_id' | 'post_membership_affiliate_id'>,
        ) => Promise<SelectQueryActionReturn<Array<ViewAffiliatePosts>>>;
        QueryReturnType: EffectlessQueryResult<ViewAffiliatePosts>;
    };
    GetSaved: {
        Action: (
            pool: PoolConnection,
            payload: Pick<ViewAffiliatePosts, 'consultant_affiliate_id'>,
        ) => Promise<SelectQueryActionReturn<Array<ViewAffiliatePosts>>>;
        QueryReturnType: EffectlessQueryResult<ViewAffiliatePosts>;
    };
    

    DeletePost: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Post, 'post_id' | 'affiliate_id'>,
        ) => Promise<UpdateQueryActionReturn>;
        QueryReturnType: EffectfulQueryResult;
    };

    SavePost: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Post, 'post_id'> & Pick<Member, 'affiliate_id'>,
        ) => Promise<{ done: true } | { done: false, message: string }>;
        QueryReturnType: EffectfulQueryResult;
    };
    UnsavePost: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Post, 'post_id'> & Pick<Member, 'affiliate_id'>,
        ) => Promise<{ done: true } | { done: false, message: string }>;
        QueryReturnType: EffectfulQueryResult;
    };
    SwitchSaved: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Post, 'post_id'> & Pick<Member, 'affiliate_id'>,
        ) => Promise<InsertionQueryActionReturn<{ saved: boolean }>>;
        QueryReturnType: EffectfulQueryResult;
    };
};

const CheckIfPostExists: PostOperation['CheckIfPostExists']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(PostOperationQuery.CheckIfPostExists, [payload.post_id], (err, results) => {
            if (err) {
                reject({ checkIfPostExistsError: err });
                return;
            }

            const parsed = results as PostOperation['CheckIfPostExists']['QueryReturnType'];

            if (!parsed.length) {
                resolve({ found: false, message: 'The post does not exist' });
                return;
            }

            resolve({ found: true, payload: parsed[0] });
        });
    });
};

const CreatePost: PostOperation['CreatePost']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(PostOperationQuery.CreatePost, [payload.entity_id, payload.body], (err, results) => {
            if (err) {
                reject({ createPostError: err });
                return;
            }

            const parsed = results as PostOperation['CreatePost']['QueryReturnType'];

            if (!parsed.affectedRows) {
                resolve({ done: false, message: 'Could not create the post' });
                return;
            }

            resolve({ done: true, payload: { post_id: parsed.insertId } });
        });
    });
};

const CreatePostMembership: PostOperation['CreatePostMembership']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        const values = payload.affiliates.map((v) => [payload.post_id, v.affiliate_id]);
        pool.query(PostOperationQuery.CreatePostMembership, [values], (err, results) => {
            if (err) {
                reject({ createPostMembershipError: err });
                return;
            }

            const parsed = results as PostOperation['CreatePostMembership']['QueryReturnType'];

            if (!parsed.affectedRows) {
                resolve({ done: false, message: 'Could not create the post membership' });
                return;
            }

            resolve({ done: true, payload });
        });


    });
};

const Create: PostOperation['Create']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        if (payload.affiliates.length === 0) {
            resolve({ done: false, message: 'Can not create the post without an affiliates list' });
            return;
        }

        pool.beginTransaction((err0) => {
            if (err0) {
                reject({ createPostBeginTransactionError: err0 });
                return;
            }

            Common.CreateEntity(pool)
            .then((res1) => {
                if (!res1.done) {
                    pool.rollback(() => {
                        resolve({ done: false, message: res1.message });
                    });
                    return;
                }

                CreatePost(pool, { entity_id: res1.payload.entity_id, body: payload.body })
                .then((res2) => {
                    if (!res2.done) {
                        pool.rollback(() => {
                            resolve({ done: false, message: res2.message });
                        });
                        return;
                    }

                    Common.CheckIfValidAffiliateByID(pool, { affiliate_id: payload.affiliates[0].affiliate_id })
                    .then((res3) => {
                        if (!res3.found) {
                            pool.rollback(() => {
                                resolve({ done: false, message: res3.message });
                            });
                            return;
                        }

                        if (!res3.payload.is_active && res3.payload.is_member) {
                            pool.rollback(() => {
                                resolve({ done: false, message: 'The member is deleted' });
                            });
                            return;
                        }

                        if (!res3.payload.is_active && res3.payload.is_board) {
                            pool.rollback(() => {
                                resolve({ done: false, message: 'The board is deleted' });
                            });
                            return;
                        }

                        if (!res3.payload.has_description && res3.payload.is_member) {
                            pool.rollback(() => {
                                resolve({ done: false, message: 'The member is invalid' });
                            });
                            return;
                        }

                        if (!res3.payload.has_description && res3.payload.is_board) {
                            pool.rollback(() => {
                                resolve({ done: false, message: 'The board is invalid' });
                            });
                            return;
                        }

                        const aux_affiliate_id = payload.affiliates[1]?.affiliate_id ?? -1;

                        Common.CheckIfValidAffiliateByID(pool, { affiliate_id: aux_affiliate_id })
                        .then((res4) => {
                            if (aux_affiliate_id !== -1) {
                                if (!res4.found) {
                                    pool.rollback(() => {
                                        resolve({ done: false, message: res4.message });
                                    });
                                    return;
                                }

                                if (res3.payload.affiliate_id === res4.payload.affiliate_id) {
                                    pool.rollback(() => {
                                        resolve({ done: false, message: 'The affiliate IDs are the same' });
                                    });
                                    return;
                                }

                                if (!res4.payload.is_active && res4.payload.is_member) {
                                    pool.rollback(() => {
                                        resolve({ done: false, message: 'The member is deleted' });
                                    });
                                    return;
                                }

                                if (!res4.payload.is_active && res4.payload.is_board) {
                                    pool.rollback(() => {
                                        resolve({ done: false, message: 'The board is deleted' });
                                    });
                                    return;
                                }

                                if (!res4.payload.has_description && res4.payload.is_member) {
                                    pool.rollback(() => {
                                        resolve({ done: false, message: 'The member is invalid' });
                                    });
                                    return;
                                }

                                if (!res4.payload.has_description && res4.payload.is_board) {
                                    pool.rollback(() => {
                                        resolve({ done: false, message: 'The board is invalid' });
                                    });
                                    return;
                                }

                                if (res3.payload.is_member && res4.payload.is_member) {
                                    pool.rollback(() => {
                                        resolve({ done: false, message: 'Both affiliate IDs refer to members' });
                                    });
                                    return;
                                }

                                if (res3.payload.is_board && res4.payload.is_board) {
                                    pool.rollback(() => {
                                        resolve({ done: false, message: 'Both affiliate IDs refer to boards' });
                                    });
                                    return;
                                }
                            }

                            CreatePostMembership(pool, { post_id: res2.payload.post_id, affiliates: payload.affiliates })
                            .then((res5) => {
                                if (!res5.done) {
                                    pool.rollback(() => {
                                        resolve({ done: false, message: res5.message });
                                    });
                                }

                                pool.commit((err6) => {
                                    if (err6) {
                                        pool.rollback(() => {
                                            reject({ createPostCommitTransactionError: err6 });
                                        });
                                        return;
                                    }

                                    resolve({ done: true, payload: { entity_id: res1.payload.entity_id, post_id: res2.payload.post_id, affiliates: payload.affiliates } });
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

const Get: PostOperation['Get']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(PostOperationQuery.Get, [payload.consultant_affiliate_id], (err, results) => {
            if (err) {
                reject({ getError: err });
                return;
            }

            const parsed = results as PostOperation['Get']['QueryReturnType'];

            if (!parsed.length) {
                resolve({ found: false, message: 'No posts found' });
                return;
            }

            resolve({ found: true, payload: parsed });
        });
    });
};

const GetFromAffiliateID: PostOperation['GetFromAffiliateID']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(PostOperationQuery.GetFromAffiliateID, [payload.consultant_affiliate_id, payload.post_membership_affiliate_id], (err, results) => {
            if (err) {
                reject({ getError: err });
                return;
            }

            const parsed = results as PostOperation['Get']['QueryReturnType'];

            if (!parsed.length) {
                resolve({ found: false, message: 'No posts found' });
                return;
            }

            resolve({ found: true, payload: parsed });
        });
    });
};

const GetSaved: PostOperation['GetSaved']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(PostOperationQuery.GetSaved, [payload.consultant_affiliate_id], (err, results) => {
            if (err) {
                reject({ getError: err });
                return;
            }

            const parsed = results as PostOperation['Get']['QueryReturnType'];

            if (!parsed.length) {
                resolve({ found: false, message: 'No posts found' });
                return;
            }

            resolve({ found: true, payload: parsed });
        });
    });
};

const DeletePost: PostOperation['DeletePost']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(PostOperationQuery.DeletePost, [payload.post_id, payload.affiliate_id], (err, results) => {
            if (err) {
                reject({ deletePostError: err });
                return;
            }

            const parsed = results as PostOperation['DeletePost']['QueryReturnType'];

            if (!parsed.changedRows) {
                resolve({ done: false, message: 'Could not delete the post' });
                return;
            }

            resolve({ done: true });
        });
    });
};

const SavePost: PostOperation['SavePost']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(PostOperationQuery.SavePost, [payload.post_id, payload.affiliate_id], (err, results) => {
            if (err) {
                reject({ savePostError: err });
                return;
            }

            const parsed = results as PostOperation['SavePost']['QueryReturnType'];

            if (!parsed.affectedRows) {
                resolve({ done: false, message: 'Could not save the post' });
                return;
            }

            resolve({ done: true });
        });
    });
};

const UnsavePost: PostOperation['UnsavePost']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(PostOperationQuery.UnsavePost, [payload.post_id, payload.affiliate_id], (err, results) => {
            if (err) {
                reject({ savePostError: err });
                return;
            }

            const parsed = results as PostOperation['SavePost']['QueryReturnType'];

            if (!parsed.affectedRows) {
                resolve({ done: false, message: 'Could not unsave the post' });
                return;
            }

            resolve({ done: true });
        });
    });
};

const SwitchSaved: PostOperation['SwitchSaved']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.beginTransaction((err0) => {
            if (err0) {
                reject({ switchSavedBeginTransactionError: err0 });
                return;
            }

            CheckIfPostExists(pool, { post_id: payload.post_id })
            .then((res1) => {
                if (!res1.found) {
                    pool.rollback(() => {
                        resolve({ done: false, message: res1.message });
                    });
                    return;
                }

                Common.CheckIfAlreadySavedByAffiliateID(pool, payload)
                .then((res2) => {
                    if (res2.found) {
                        UnsavePost(pool, payload)
                        .then((res3) => {
                            if (!res3.done) {
                                pool.rollback(() => {
                                    resolve(res3);
                                });
                                return;
                            }

                            pool.commit((err4) => {
                                if (err4) {
                                    pool.rollback(() => {
                                        reject({ switchSavedCommitTransactionError: err4 });
                                    });
                                    return;
                                }

                                resolve({ done: true, payload: { saved: false } });
                            });
                        })
                        .catch((err3) => {
                            pool.rollback(() => {
                                reject({ unsavePostError: err3 });
                            });
                        });

                        return;
                    }

                    SavePost(pool, payload)
                    .then((res3) => {
                        if (!res3.done) {
                            pool.rollback(() => {
                                resolve(res3);
                            });
                            return;
                        }

                        pool.commit((err4) => {
                            if (err4) {
                                pool.rollback(() => {
                                    reject({ switchSavedCommitTransactionError: err4 });
                                });
                                return;
                            }

                            resolve({ done: true, payload: { saved: true } });
                        });
                    })
                    .catch((err3) => {
                        pool.rollback(() => {
                            reject({ savePostError: err3 });
                        });
                    });
                })
                .catch((err2) => {
                    pool.rollback(() => {
                        reject({ checkIfAlreadySavedByAffiliateIDError: err2 });
                    });
                });
            })
            .catch((err1) => {
                if (err1) {
                    pool.rollback(() => {
                        reject({ checkIfPostExistsError: err1 });
                    });
                }
            });
        });
    });
};

const Posts = {
    Create,
    Get,
    GetFromAffiliateID,
    GetSaved,
    DeletePost,
    SwitchSaved,
};

export default Posts;
