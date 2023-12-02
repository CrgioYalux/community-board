import express from 'express';

import { ROUTE } from '../route';
import Handler from '../handler';

const router = express.Router();

router.post(ROUTE.MEMBERS.POST_MINIMAL, Handler.Members.PostMinimal);
router.post(ROUTE.MEMBERS.POST_DESCRIPTION, Handler.Members.PostDescription);

export default router;

