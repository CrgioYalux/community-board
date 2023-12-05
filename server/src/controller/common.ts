import type { PoolConnection } from 'mysql';

enum CommonOperationQuery {
    CheckIfAlreadySavedByAffiliateID = `
        SELECT * FROM post_saved ps WHERE ps.post_id = ? AND ps.affiliate_id = ?
    `,

    CreateEntity = `INSERT INTO entity VALUES ()`,
    CreateAffiliate = `INSERT INTO affiliate (entity_id) VALUES (?)`,

    DeleteEntity = `UPDATE entity e SET e.is_active = 0 WHERE e.id = ?`,
};

interface CommonOperation {
    CheckIfAlreadySavedByAffiliateID: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Post, 'post_id'> & Pick<Affiliate, 'affiliate_id'>,
        ) => Promise<SelectQueryActionReturn<Pick<Post, 'post_id'> & Pick<Affiliate, 'affiliate_id'>>>;
        QueryReturnType: EffectlessQueryResult<Pick<Post, 'post_id'> & Pick<Affiliate, 'affiliate_id'>>;
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
        ) => Promise<InsertionQueryActionReturn<Pick<Affiliate, 'entity_id' | 'affiliate_id'>>>;
        QueryReturnType: EffectfulQueryResult;
    };

    DeleteEntity: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Member, 'entity_id'>,
        ) => Promise<DeleteQueryActionReturn>;
        QueryReturnType: EffectfulQueryResult;
    };
};

const CheckIfAlreadySavedByAffiliateID: CommonOperation['CheckIfAlreadySavedByAffiliateID']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(CommonOperationQuery.CheckIfAlreadySavedByAffiliateID, [payload.post_id, payload.affiliate_id], (err, results) => {
            if (err) {
                reject({ checkIfAlreadySavedByAffiliateIDError: err });
                return;
            }

            const parsed = results as CommonOperation['CheckIfAlreadySavedByAffiliateID']['QueryReturnType'];

            if (!parsed.length) {
                resolve({ found: false, message: 'Could not find a relation between the post and the affiliate' });
                return;
            }

            resolve({ found: true, payload });
        });
    });
};

const CreateEntity: CommonOperation['CreateEntity']['Action'] = (pool) => {
    return new Promise((resolve, reject) => {
        pool.query(CommonOperationQuery.CreateEntity, (err, results) => {
            if (err) {
                reject({ createEntityError: err });
                return;
            }

            const parsed = results as CommonOperation['CreateEntity']['QueryReturnType'];

            if (!parsed.affectedRows) {
                resolve({ done: false, message: 'Could not create the entity' });
                return;
            }

            resolve({ done: true, payload: { entity_id: parsed.insertId } });
        });
    });
};

const CreateAffiliate: CommonOperation['CreateAffiliate']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(CommonOperationQuery.CreateAffiliate, [payload.entity_id], (err, results) => {
            if (err) {
                reject({ createAffiliateError: err });
                return;
            }

            const parsed = results as CommonOperation['CreateAffiliate']['QueryReturnType'];

            if (!parsed.affectedRows) {
                resolve({ done: false, message: 'Could not create the affiliate' });
                return;
            }

            resolve({ done: true, payload: { entity_id: payload.entity_id, affiliate_id: parsed.insertId } });
        });
    });
};

const DeleteEntity: CommonOperation['DeleteEntity']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(CommonOperationQuery.DeleteEntity, [payload.entity_id], (err, results) => {
            if (err) {
                reject({ deleteEntityError: err });
                return;
            }

            const parsed = results as CommonOperation['DeleteEntity']['QueryReturnType'];

            if (!parsed.changedRows) {
                resolve({ done: false, message: 'Could not find an entity with that ID' });
                return;
            }

            resolve({ done: true });
        });
    });
};

const Common = {
    CheckIfAlreadySavedByAffiliateID,
    CreateEntity,
    CreateAffiliate,
    DeleteEntity,
};

export default Common;
