import type { Request, Response, NextFunction } from 'express';

import db from '../../db';
import Controller from '../../controller';

function Post(request: Request<{}, {}, Pick<Post, 'body' | 'affiliate_id'>>, response: Response, next: NextFunction): void {
    if (request.body.body === undefined || (request.body.body !== undefined && request.body.body.length === 0)) {
        response.status(400).send({ message: 'There\'s empty required fields' });
        return;
    }

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
            body: request.body.body,
            affiliates: [Number(response.locals.session.affiliate_id), Number(request.body.affiliate_id)].filter(Boolean).map((v) => ({ affiliate_id: v })),
        };

        Controller.Posts.Create(connection, payload)
        .then((res) => {
            connection.release();
            
            if (!res.done) {
                response.status(400).send({ created: false, message: res.message });
                return;
            }

            response.status(201).send({ created: true, payload: res.payload });
        })
        .catch(next);
    });
}

function GetByAffiliateID(request: Request, response: Response, next: NextFunction): void {
    db.pool.getConnection((err, connection) => {
        if (err) {
            connection.release();
            
            const error = new Error('Could not connect to database');
            next(error);

            return;
        }

        const affiliate_id = request.params[0];
        const parsed_affiliate_id = Number(affiliate_id);
        const session_affiliate_id = response.locals?.session?.affiliate_id;
        const session_member_id = Number(response.locals?.session?.member_id);

        const own = affiliate_id === undefined 
            ? { member_affiliate_id: session_affiliate_id, member_id: session_member_id } 
            : { member_affiliate_id: undefined, member_id: undefined };
        const own_board = affiliate_id !== undefined 
            ? { member_affiliate_id: session_affiliate_id, member_id: session_member_id, board_affiliate_id: parsed_affiliate_id } 
            : { member_affiliate_id: undefined, member_id: undefined, board_affiliate_id: undefined };
        const public_world = affiliate_id !== undefined 
            ? { affiliate_id: parsed_affiliate_id } 
            : { affiliate_id: undefined };

        Controller.Posts.GetByAffiliateID(connection, { own, own_board, public_world })
        .then((res) => {
            connection.release();

            response.status(200).send(res);
        })
        .catch(next);
    });
}

function Delete(request: Request, response: Response, next: NextFunction): void {
    if (response.locals.session === undefined || response.locals.session.affiliate_id === undefined) {
        response.status(400).send({ message: 'There\'s empty required fields' });
        return;
    }

    const affiliate_id = Number(response.locals.session.affiliate_id);
    const post_id = Number(request.params[0]);

    db.pool.getConnection((err, connection) => {
        if (err) {
            connection.release();
            
            const error = new Error('Could not connect to database');
            next(error);

            return;
        }

        Controller.Posts.DeletePost(connection, { affiliate_id, post_id })
        .then((res) => {
            connection.release();

            if (!res.done) {
                response.status(400).send({ deleted: false, message: res.message });
                return;
            }

            response.status(200).send({ deleted: true });
        })
        .catch(next);
    });
}

function SwitchSaved(request: Request, response: Response, next: NextFunction): void {
    if (response.locals.session === undefined || response.locals.session.affiliate_id === undefined) {
        response.status(400).send({ message: 'There\'s empty required fields' });
        return;
    }

    const affiliate_id = Number(response.locals.session.affiliate_id);
    const post_id = Number(request.params[0]);

    db.pool.getConnection((err, connection) => {
        if (err) {
            connection.release();
            
            const error = new Error('Could not connect to database');
            next(error);

            return;
        }

        Controller.Posts.SwitchSaved(connection, { affiliate_id, post_id })
        .then((res) => {
            connection.release();

            if (!res.done) {
                response.status(400).send({ done: false, message: res.message });
                return;
            }

            response.status(200).send({ done: true, payload: res.payload });
        })
        .catch(next);
    });
}

const Posts = {
    Post,
    GetByAffiliateID,
    Delete,
    SwitchSaved,
};

export default Posts;
