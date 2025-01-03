import type { Request, Response, NextFunction } from 'express';

function Get(request: Request, response: Response, next: NextFunction): void {
	response.status(200).send('pong');
	return;
}

const Pong = {
	Get,
};

export default Pong;
