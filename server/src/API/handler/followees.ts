import type { Request, Response, NextFunction } from 'express';

import Controller from '../../controller';
import db from '../../db';

function Get(request: Request, response: Response, next: NextFunction): void {
    db.pool.getConnection((err, connection) => {
        if (err) {
            connection.release();

            const error = new Error('Could not connect to database');
            next(error);

            return;
        }

        const consultant_affiliate_id = Number(request.params[0]);

        Controller.Members.GetFolloweesListed(connection, { consultant_affiliate_id })
        .then((res) => {
            connection.release();

            response.status(200).send(res);
        })
        .catch(next);
    });
}

const Followees = {
    Get,
};

export default Followees;
