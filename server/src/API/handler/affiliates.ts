import type { Request, Response, NextFunction } from 'express';

import Controller from '../../controller';
import db from '../../db';

function Follow(request: Request, response: Response, next: NextFunction): void {
    if (response.locals.session === undefined || response.locals.session.member_id === undefined) {
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
            from_member_id: Number(response.locals.session.member_id),
            to_affiliate_id: Number(request.params[0]),
        };

        Controller.Members.Follow(connection, payload)
        .then((res) => {
            connection.release();

            response.status(200).send(res);
        })
        .catch(next);
    });
}

function Unfollow(request: Request<Request['params'], {}, Pick<MemberFollowRequest, 'follow_request_id'>>, response: Response, next: NextFunction): void {
    if (request.body.follow_request_id === undefined) {
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
            follow_request_id: Number(request.body.follow_request_id),
            to_affiliate_id: Number(request.params[0]),
        };

        Controller.Members.DeleteFollowRequest(connection, payload)
        .then((res) => {
            connection.release();

            response.status(200).send(res);
        })
        .catch(next);
    });
}

const Affiliates = {
    Follow,
    Unfollow,
};

export default Affiliates;
