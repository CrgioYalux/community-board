import type { Request, Response, NextFunction } from 'express';

import Controller from '../../controller';
import db from '../../db';
import Helper from '../../helper';

function Auth(request: Request<{}, {}, MemberLogin>, response: Response, next: NextFunction): void {
    if (request.body.username === undefined || request.body.password === undefined) {
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

        Controller.Members.CheckIfCredentialsMatch(connection, request.body)
        .then((res) => {
            if (!res.found) {
                connection.release();

                response.status(401).send({ authenticated: false, message: res.message });
                return;
            }

            const token = Helper.generateAccessToken({ ...res.payload, username: request.body.username })

            const payload = {
                token,
                ...res.payload,
            };

            response.status(200).send({ authenticated: true, payload });
        })
        .catch(next);
    });
}

function PostMinimal(request: Request<{}, {}, MemberLogin>, response: Response, next: NextFunction): void {
    if (request.body.username === undefined || request.body.password === undefined) {
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

        Controller.Members.CreateMinimalMember(connection, request.body)
        .then((res) => {
            connection.release();

            if (!res.done) {
                response.status(400).send({ created: false, message: res.message });
                return;
            }

            const token = Helper.generateAccessToken({ ...res.payload, username: request.body.username })

            const payload = {
                token,
                ...res.payload,
            };

            response.status(201).send({ created: true, payload });
        })
        .catch(next);
    });
}

function PostDescription(request: Request<Request['params'], {}, Partial<MemberDescription>>, response: Response, next: NextFunction): void {
    if (response.locals.session === undefined || response.locals.session.entity_id === undefined || response.locals.session.member_id === undefined) {
        response.status(400).send({ message: 'There\'s empty required fields' });
        return;
    }

    const member_id = Number(request.params[0]);

    if (member_id !== Number(response.locals.session.member_id)) {
        response.status(401).send({ message: 'Session\'s member ID and passed ID don\'t match' });
        return;
    }

    db.pool.getConnection((err, connection) => {
        if (err) {
            connection.release();

            const error = new Error('Could not connect to database');
            next(error);

            return;
        }

        Controller.Members.CreateMemberDescription(connection, { member_id, ...request.body })
        .then((res) => {
            connection.release();

            const status = res.done ? 201 : 400;

            response.status(status).send(res);
            return;
        })
        .catch(next);
    });
}

function PostFull(request: Request<{}, {}, MemberLogin & Partial<MemberDescription>>, response: Response, next: NextFunction): void {
    db.pool.getConnection((err, connection) => {
        if (err) {
            connection.release();

            const error = new Error('Could not connect to database');
            next(error);

            return;
        }

        Controller.Members.CreateFullMember(connection, request.body)
        .then((res) => {
            connection.release();

            if (!res.done) {
                response.status(400).send({ created: false, message: res.message });
                return;
            }

            const token = Helper.generateAccessToken({ ...res.payload, username: request.body.username })

            const payload = {
                token,
                ...res.payload,
            };

            response.status(201).send({ created: true, payload });
        })
        .catch(next);
    });
}

function Delete(request: Request, response: Response, next: NextFunction): void {
    if (response.locals.session === undefined || response.locals.session.entity_id === undefined || response.locals.session.member_id === undefined) {
        response.status(400).send({ message: 'There\'s empty required fields' });
        return;
    }

    const entity_id = Number(response.locals.session.entity_id);
    const member_id = Number(request.params[0]);

    if (member_id !== Number(response.locals.session.member_id)) {
        response.status(401).send({ message: 'Session\'s member ID and passed ID don\'t match' });
        return;
    }

    db.pool.getConnection((err, connection) => {
        if (err) {
            connection.release();

            const error = new Error('Could not connect to database');
            next(error);

            return;
        }

        Controller.Common.DeleteEntity(connection, { entity_id })
        .then((res) => {
            connection.release();

            if (!res.done) {
                response.status(400).send({ done: false, message: 'Could not delete the member' });
                return;
            }

            response.status(200).send({ done: true });
        })
        .catch(next);
    });
}
    
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

function Patch(request: Request<Request['params'], {}, Partial<MemberDescription>>, response: Response, next: NextFunction): void {
    if (response.locals.session === undefined || response.locals.session.entity_id === undefined || response.locals.session.member_id === undefined) {
        response.status(400).send({ message: 'There\'s empty required fields' });
        return;
    }

    const member_id = Number(request.params[0]);

    if (member_id !== Number(response.locals.session.member_id)) {
        response.status(401).send({ message: 'Session\'s member ID and passed ID don\'t match' });
        return;
    }

    db.pool.getConnection((err, connection) => {
        if (err) {
            connection.release();

            const error = new Error('Could not connect to database');
            next(error);

            return;
        }

        Controller.Members.UpdateMemberDescription(connection, { member_id, ...request.body })
        .then((res) => {
            connection.release();

            response.status(200).send(res);
        })
        .catch(next);
    });
}

const Members = {
    Auth,
    PostMinimal,
    PostDescription,
    PostFull,
    Delete,
    Follow,
    Patch,
};

export default Members;
