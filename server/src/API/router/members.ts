import express from 'express';

import { ROUTE } from '../route';
import Handler from '../handler';

const router = express.Router();

router.delete(ROUTE.MEMBERS.DELETE, Handler.Members.Delete);

export default router;

