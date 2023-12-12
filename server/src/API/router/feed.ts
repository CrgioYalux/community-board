import express from 'express';

import { ROUTE } from '../route';
import Handler from '../handler';

const router = express.Router();

router.get(ROUTE.FEED.GET, Handler.Feed.Get);
router.get(ROUTE.FEED.GET_FROM_AFFILIATE_ID, Handler.Feed.GetFromAffiliateID);

export default router;
