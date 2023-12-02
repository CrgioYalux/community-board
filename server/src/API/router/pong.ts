import express from 'express';

import { ROUTE} from '../route';
import Handler from '../handler';

const router = express.Router();

router.get(ROUTE.PONG.GET, Handler.Pong.Get);

export default router;
