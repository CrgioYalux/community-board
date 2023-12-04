import express from 'express';

import { ROUTE } from '../route';
import Handler from '../handler';

const router = express.Router();

router.post(ROUTE.MEMBERS.POST_DESCRIPTION, Handler.Members.PostDescription);
router.delete(ROUTE.MEMBERS.DELETE, Handler.Members.Delete);

export default router;

