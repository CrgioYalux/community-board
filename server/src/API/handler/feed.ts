import type { Request, Response, NextFunction } from 'express';

import db from '../../db';
import Controller from '../../controller';

function Get(request: Request, response: Response, next: NextFunction): void {
    if (response.locals.session === undefined || response.locals.session.affiliate_id === undefined) {
        response.status(400).send({ message: 'There\'s empty required fields' });
        return;
    }

    db.pool.getConnection((err, connection) => {
        if (err) {
            connection.release();
            
            const error = new Error('Could not connect to database');
            next(error);

            return;
        }

        const consultant_affiliate_id = Number(response.locals.session.affiliate_id);

        Controller.Posts.Get(connection, { consultant_affiliate_id })
        .then((res) => {
            connection.release();

            response.status(200).send(res);
        })
        .catch(next);
    });
}

function GetFromAffiliateID(request: Request, response: Response, next: NextFunction): void {
    if (response.locals.session === undefined || response.locals.session.affiliate_id === undefined) {
        response.status(400).send({ message: 'There\'s empty required fields' });
        return;
    }

    db.pool.getConnection((err, connection) => {
        if (err) {
            connection.release();
            
            const error = new Error('Could not connect to database');
            next(error);

            return;
        }

        const consultant_affiliate_id = Number(response.locals.session.affiliate_id);
        const post_membership_affiliate_id = Number(request.params[0]);

        Controller.Posts.GetFromAffiliateID(connection, { consultant_affiliate_id, post_membership_affiliate_id })
        .then((res) => {
            connection.release();

            response.status(200).send(res);
        })
        .catch(next);
    });
};

function GetSaved(request: Request, response: Response, next: NextFunction): void {
    if (response.locals.session === undefined || response.locals.session.affiliate_id === undefined) {
        response.status(400).send({ message: 'There\'s empty required fields' });
        return;
    }

    db.pool.getConnection((err, connection) => {
        if (err) {
            connection.release();
            
            const error = new Error('Could not connect to database');
            next(error);

            return;
        }

        const consultant_affiliate_id = Number(response.locals.session.affiliate_id);

        Controller.Posts.GetSaved(connection, { consultant_affiliate_id })
        .then((res) => {
            connection.release();

            response.status(200).send(res);
        })
        .catch(next);
    });
}

const Feed = {
    Get,
    GetFromAffiliateID,
    GetSaved,
};

export default Feed;
