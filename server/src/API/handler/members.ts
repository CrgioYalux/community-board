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

		Controller.Members.GetExtended(connection)
			.then((res) => {
				connection.release();

				response.status(200).send(res);
			})
			.catch(next);
	});
}

function GetByID(
	request: Request,
	response: Response,
	next: NextFunction
): void {
	const member_id = Number(request.params[0]);

	db.pool.getConnection((err, connection) => {
		if (err) {
			connection.release();

			const error = new Error('Could not connect to database');
			next(error);

			return;
		}

		Controller.Members.GetExtendedByID(connection, { member_id })
			.then((res) => {
				connection.release();

				const status = res.found ? 200 : 404;
				response.status(status).send(res);
			})
			.catch(next);
	});
}

function GetFromMemberPovByUsername(
	request: Request,
	response: Response,
	next: NextFunction
): void {
	if (
		response.locals.session === undefined ||
		response.locals.session.member_id === undefined
	) {
		response.status(400).send({ message: "There's empty required fields" });
		return;
	}

	db.pool.getConnection((err, connection) => {
		if (err) {
			connection.release();

			const error = new Error('Could not connect to database');
			next(error);

			return;
		}

		const consultant_member_id = Number(response.locals.session.member_id);
		const username = request.params[0];

		Controller.Members.GetFromMemberPovByUsername(connection, {
			consultant_member_id,
			username,
		})
			.then((res) => {
				connection.release();

				if (!res.found) {
					response.status(404).send(res);
					return;
				}

				response.status(200).send(res);
			})
			.catch(next);
	});
}

function Delete(
	request: Request,
	response: Response,
	next: NextFunction
): void {
	if (
		response.locals.session === undefined ||
		response.locals.session.entity_id === undefined ||
		response.locals.session.member_id === undefined
	) {
		response.status(400).send({ message: "There's empty required fields" });
		return;
	}

	const entity_id = Number(response.locals.session.entity_id);
	const member_id = Number(request.params[0]);

	if (member_id !== Number(response.locals.session.member_id)) {
		response
			.status(401)
			.send({ message: "Session's member ID and passed ID don't match" });
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

				response.status(200).send(res);
			})
			.catch(next);
	});
}

function Patch(
	request: Request<Request['params'], {}, Partial<MemberDescription>>,
	response: Response,
	next: NextFunction
): void {
	if (
		response.locals.session === undefined ||
		response.locals.session.entity_id === undefined ||
		response.locals.session.member_id === undefined
	) {
		response.status(400).send({ message: "There's empty required fields" });
		return;
	}

	const member_id = Number(request.params[0]);

	if (member_id !== Number(response.locals.session.member_id)) {
		response
			.status(401)
			.send({ message: "Session's member ID and passed ID don't match" });
		return;
	}

	db.pool.getConnection((err, connection) => {
		if (err) {
			connection.release();

			const error = new Error('Could not connect to database');
			next(error);

			return;
		}

		Controller.Members.UpdateMemberDescription(connection, {
			member_id,
			...request.body,
		})
			.then((res) => {
				connection.release();

				response.status(200).send(res);
			})
			.catch(next);
	});
}

const Members = {
	Get,
	GetByID,
	GetFromMemberPovByUsername,
	Delete,
	Patch,
};

export default Members;
