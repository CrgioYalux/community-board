import express from 'express';

import { ROUTE } from '../route';
import Handler from '../handler';

const router = express.Router();

router.post(ROUTE.MEMBERS.POST_DESCRIPTION, Handler.Members.PostDescription);
router.delete(ROUTE.MEMBERS.DELETE, Handler.Members.Delete);
router.patch(ROUTE.MEMBERS.PATCH, Handler.Members.Patch);

export default router;

