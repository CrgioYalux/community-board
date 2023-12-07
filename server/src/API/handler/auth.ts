import type { Request, Response, NextFunction } from 'express';

import Controller from '../../controller';
import db from '../../db';
import Helper from '../../helper';

function Login(request: Request<{}, {}, MemberLogin>, response: Response, next: NextFunction): void {
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

function RegisterMinimal(request: Request<{}, {}, MemberLogin>, response: Response, next: NextFunction): void {
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

function RegisterDescription(request: Request<Request['params'], {}, Partial<MemberDescription>>, response: Response, next: NextFunction): void {
    if (response.locals.session === undefined || response.locals.session.member_id === undefined) {
        response.status(400).send({ message: 'There\'s empty required fields' });
        return;
    }

    const member_id = Number(response.locals.session.member_id);

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

function RegisterFull(request: Request<{}, {}, MemberLogin & Partial<MemberDescription>>, response: Response, next: NextFunction): void {
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

const Auth = {
    Login,
    RegisterMinimal,
    RegisterDescription,
    RegisterFull,
};

export default Auth;
