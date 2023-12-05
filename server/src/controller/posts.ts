import type { PoolConnection } from 'mysql';
import Common from './common';

enum PostOperationQuery {
    CheckIfPostExists = `SELECT * FROM post p WHERE p.id = ?`,

    CreatePost = `INSERT INTO post (entity_id, body, from_affiliate_id) VALUES (?, ?, ?)`,

    DeletePost = `
        UPDATE entity e
        SET e.is_active = 0
        WHERE e.id = (
            SELECT p.entity_id
            FROM post p
            WHERE p.id = ? AND p.from_affiliate_id = ?
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
            payload: Pick<Post, 'from_affiliate_id' | 'body'>
        ) => Promise<InsertionQueryActionReturn<PostIdentificator>>;
        QueryReturnType: EffectfulQueryResult;
    };

    DeletePost: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Post, 'post_id' | 'from_affiliate_id'>,
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

                pool.query(PostOperationQuery.CreatePost, [res1.payload.entity_id, payload.body, payload.from_affiliate_id], (err1, results) => {
                    if (err1) {
                        pool.rollback(() => {
                            reject({ createPostError: err1 });
                        });
                        return;
                    }

                    const parsed = results as PostOperation['CreatePost']['QueryReturnType'];

                    if (!parsed.affectedRows) {
                        pool.rollback(() => {
                            resolve({ done: false, message: 'Could not create the post' });
                        });
                        return;
                    }

                    pool.commit((err3) => {
                        if (err3) {
                            pool.rollback(() => {
                                reject({ createPostCommitTransactionError: err3 });
                            });
                            return;
                        }

                        resolve({ done: true, payload: { entity_id: res1.payload.entity_id, post_id: parsed.insertId } });
                    });
                });
            })
            .catch((err1) => {
                pool.rollback(() => {
                    reject({ createEntityError: err1 });
                });
            });
        });
    });
};

const DeletePost: PostOperation['DeletePost']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(PostOperationQuery.DeletePost, [payload.post_id, payload.from_affiliate_id], (err, results) => {
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
    CreatePost,
    DeletePost,
    SwitchSaved,
};

export default Posts;
