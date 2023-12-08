import express from 'express';

import { ROUTE } from '../route';
import Handler from '../handler';

const router = express.Router();

router.post(ROUTE.AFFILIATES.FOLLOW, Handler.Affiliates.Follow);
router.delete(ROUTE.AFFILIATES.UNFOLLOW, Handler.Affiliates.Unfollow);

export default router;
