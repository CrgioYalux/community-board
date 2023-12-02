import type { Request, Response, NextFunction } from 'express';

import Controller from '../../controller';
import db from '../../db';

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

const Members = {
    PostMinimal,
    PostDescription,
};

export default Members;
