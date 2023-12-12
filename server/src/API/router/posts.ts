import express from 'express';

import { ROUTE } from '../route';
import Handler from '../handler';

const router = express.Router();

router.post(ROUTE.POSTS.POST, Handler.Posts.Post);
router.get(ROUTE.POSTS.GET, Handler.Posts.GetByAffiliateID);
router.delete(ROUTE.POSTS.DELETE, Handler.Posts.Delete);
router.post(ROUTE.POSTS.SWITCH_SAVE, Handler.Posts.SwitchSaved);

export default router;
