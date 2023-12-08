import type { PoolConnection } from 'mysql';

enum CommonOperationQuery {
    CheckIfAlreadySavedByAffiliateID = `
        SELECT * FROM post_saved ps WHERE ps.post_id = ? AND ps.affiliate_id = ?
    `,
    CheckIfValidAffiliateByID = `
        SELECT
            IF(e.is_active = 1, TRUE, FALSE) AS is_active,
            e.id AS entity_id,
            a.id AS affiliate_id,
            IF(m.id IS NULL, FALSE, TRUE) AS is_member,
            IF(b.id IS NULL, FALSE, TRUE) AS is_board,
            IF(md.member_id IS NULL, IF(bd.board_id IS NULL, FALSE, TRUE), TRUE) AS has_description,
            IF(md.is_private IS NULL, NULL, IF(md.is_private = 1, TRUE, FALSE)) AS is_private
        FROM entity e
        JOIN affiliate a ON e.id = a.entity_id
        LEFT JOIN member m ON a.id = m.affiliate_id
        LEFT JOIN member_description md ON m.id = md.member_id
        LEFT JOIN board b ON a.id = b.affiliate_id
        LEFT JOIN board_description bd ON b.id = bd.board_id
        WHERE a.id = ?
        LIMIT 1
    `,

    CreateEntity = `INSERT INTO entity VALUES ()`,
    CreateAffiliate = `INSERT INTO affiliate (entity_id) VALUES (?)`,

    DeleteEntity = `UPDATE entity e SET e.is_active = 0 WHERE e.id = ?`,

    GetAffiliateFollowRequests = `SELECT * FROM affiliate_pending_follow_requests apfr WHERE apfr.followee_affiliate_id = ?`,
};

interface CommonOperation {
    CheckIfAlreadySavedByAffiliateID: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Post, 'post_id'> & Pick<Affiliate, 'affiliate_id'>,
        ) => Promise<SelectQueryActionReturn<Pick<Post, 'post_id'> & Pick<Affiliate, 'affiliate_id'>>>;
        QueryReturnType: EffectlessQueryResult<Pick<Post, 'post_id'> & Pick<Affiliate, 'affiliate_id'>>;
    };
    CheckIfValidAffiliateByID: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Affiliate, 'affiliate_id'>,
        ) => Promise<SelectQueryActionReturn<Pick<Member, 'is_active' | 'entity_id' | 'affiliate_id' | 'is_member' | 'is_board' | 'has_description' | 'is_private'>>>;
        QueryReturnType: EffectlessQueryResult<Pick<Member, 'is_active' | 'entity_id' | 'affiliate_id' | 'is_member' | 'is_board' | 'has_description' | 'is_private'>>;
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

    GetAffiliateFollowRequests: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Affiliate, 'affiliate_id'>,
        ) => Promise<SelectQueryActionReturn<Array<AffiliateFollowRequest>>>;
        QueryReturnType: EffectlessQueryResult<AffiliateFollowRequest>;
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

const CheckIfValidAffiliateByID: CommonOperation['CheckIfValidAffiliateByID']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        if (payload.affiliate_id < 0) {
            resolve({ found: false, message: '' });
            return;
        }

        pool.query(CommonOperationQuery.CheckIfValidAffiliateByID, [payload.affiliate_id], (err, results) => {
            if (err) {
                reject({ checkIfValidAffiliateByIDError: err });
                return;
            }

            const parsed = results as CommonOperation['CheckIfValidAffiliateByID']['QueryReturnType'];

            if (!parsed.length) {
                resolve({ found: false, message: 'Could not find a member or board with that ID' });
                return;
            }

            resolve({ found: true, payload: parsed[0] });
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

const GetAffiliateFollowRequests: CommonOperation['GetAffiliateFollowRequests']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(CommonOperationQuery.GetAffiliateFollowRequests, [payload.affiliate_id], (err, results) => {
            if (err) {
                reject({ getFollowRequestsError: err });
                return;
            }

            const parsed = results as CommonOperation['GetAffiliateFollowRequests']['QueryReturnType'];

            if (!parsed.length) {
                resolve({ found: false, message: 'No follow requests found' });
                return;
            }

            resolve({ found: true, payload: parsed });
        });
    });
};

const Common = {
    CheckIfAlreadySavedByAffiliateID,
    CheckIfValidAffiliateByID,
    CreateEntity,
    CreateAffiliate,
    DeleteEntity,
    GetAffiliateFollowRequests,
};

export default Common;
