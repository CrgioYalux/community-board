import type { Request, Response, NextFunction } from 'express';

import Controller from '../../controller';
import db from '../../db';

function Accept(request: Request, response: Response, next: NextFunction): void {
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

        const payload = {
            to_affiliate_id: Number(response.locals.session.affiliate_id),
            follow_request_id: Number(request.params[0]),
        };

        Controller.Members.AcceptFollowRequest(connection, payload)
        .then((res) => {
            connection.release();

            response.status(200).send(res);
        })
        .catch(next);
    });
}

function Decline(request: Request, response: Response, next: NextFunction): void {
    db.pool.getConnection((err, connection) => {
        if (err) {
            connection.release();

            const error = new Error('Could not connect to database');
            next(error);

            return;
        }

        const follow_request_id = Number(request.params[0]);

        Controller.Members.DeclineFollowRequest(connection, { follow_request_id })
        .then((res) => {
            connection.release();

            response.status(200).send(res);
        })
        .catch(next);
    });
}

function Get(request: Request, response: Response, next: NextFunction): void {
    db.pool.getConnection((err, connection) => {
        if (err) {
            connection.release();

            const error = new Error('Could not connect to database');
            next(error);

            return;
        }

        const consultant_affiliate_id = Number(request.params[0]);

        Controller.Members.GetFollowersListed(connection, { consultant_affiliate_id })
        .then((res) => {
            connection.release();

            response.status(200).send(res);
        })
        .catch(next);
    });
}

function GetRequests(request: Request, response: Response, next: NextFunction): void {
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

        Controller.Common.GetAffiliateFollowRequests(connection, { consultant_affiliate_id })
        .then((res) => {
            connection.release();

            response.status(200).send(res);
        })
        .catch(next);
    });
}

const Followers = {
    Accept,
    Decline,
    Get,
    GetRequests,
};

export default Followers;
