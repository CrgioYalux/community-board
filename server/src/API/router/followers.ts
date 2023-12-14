import express from 'express';

import { ROUTE } from '../route';
import Handler from '../handler';

const router = express.Router();

router.patch(ROUTE.FOLLOWERS.ACCEPT_FOLLOW, Handler.Followers.Accept);
router.delete(ROUTE.FOLLOWERS.DECLINE_FOLLOW, Handler.Followers.Decline);
router.get(ROUTE.FOLLOWERS.GET, Handler.Followers.Get);
router.get(ROUTE.FOLLOWERS.GET_REQUESTS, Handler.Followers.GetRequests);

export default router;
