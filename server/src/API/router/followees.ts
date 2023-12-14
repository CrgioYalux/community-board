import express from 'express';

import { ROUTE } from '../route';
import Handler from '../handler';

const router = express.Router();

router.get(ROUTE.FOLLOWEES.GET, Handler.Followees.Get);

export default router;
