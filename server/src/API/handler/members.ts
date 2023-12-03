import type { Request, Response, NextFunction } from 'express';

import Controller from '../../controller';
import db from '../../db';
import Helper from '../../helper';

type AuthRequestBody = Pick<Member, 'username' | 'password'>;
function Auth(request: Request<{}, {}, AuthRequestBody>, response: Response, next: NextFunction): void {
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

type PostMinimalRequestBody = Pick<Member, 'username' | 'password'>;
function PostMinimal(request: Request<{}, {}, PostMinimalRequestBody>, response: Response, next: NextFunction): void {
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

            const status = res.done ? 201 : 400;

            response.status(status).send(res);
            return;
        })
        .catch(next);
    });
}

type PostDescriptionRequestBody = Partial<Pick<Member, 'email' | 'fullname' | 'bio' | 'birthdate' | 'is_private'>>;
function PostDescription(request: Request<Request['params'], {}, PostDescriptionRequestBody>, response: Response, next: NextFunction): void {
    const memberID = Number(request.params[0]);

    db.pool.getConnection((err, connection) => {
        if (err) {
            connection.release();

            const error = new Error('Could not connect to database');
            next(error);

            return;
        }

        Controller.Members.CreateMemberDescription(connection, { member_id: memberID, ...request.body })
        .then((res) => {
            connection.release();

            const status = res.done ? 201 : 400;

            response.status(status).send(res);
            return;
        })
        .catch(next);
    });
}

type PostFullRequestBody = Pick<Member, 'username' | 'password'> & Partial<Pick<Member, 'email' | 'fullname' | 'bio' | 'birthdate' | 'is_private'>>;
function PostFull(request: Request<{}, {}, PostFullRequestBody>, response: Response, next: NextFunction): void {
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

            const status = res.done ? 201 : 400;

            response.status(status).send(res);
            return;
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

    if (member_id !== response.locals.session.member_id) {
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

        Controller.Members.DeleteEntity(connection, { entity_id })
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

const Members = {
    Auth,
    PostMinimal,
    PostDescription,
    PostFull,
    Delete,
};

export default Members;
