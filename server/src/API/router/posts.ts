import express from 'express';

import { ROUTE } from '../route';
import Handler from '../handler';

const router = express.Router();

router.post(ROUTE.POSTS.POST, Handler.Posts.Post);
router.delete(ROUTE.POSTS.DELETE, Handler.Posts.Delete);
router.post(ROUTE.POSTS.SAVE, Handler.Posts.SwitchSaved);

export default router;
