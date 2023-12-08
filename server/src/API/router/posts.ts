import express from 'express';

import { ROUTE } from '../route';
import Handler from '../handler';

const Authenticated = express.Router();
const NonAuthenticated = express.Router();

NonAuthenticated.get(ROUTE.POSTS.GET_BY_AFFILIATE_ID, Handler.Posts.GetByAffiliateID);
// get feed

Authenticated.post(ROUTE.POSTS.POST, Handler.Posts.Post);
Authenticated.get(ROUTE.POSTS.GET, Handler.Posts.GetByAffiliateID);
Authenticated.get(ROUTE.POSTS.GET_BY_AFFILIATE_ID, Handler.Posts.GetByAffiliateID);
Authenticated.delete(ROUTE.POSTS.DELETE, Handler.Posts.Delete);
Authenticated.post(ROUTE.POSTS.SAVE, Handler.Posts.SwitchSaved);

const router = {
    Authenticated,
    NonAuthenticated,
};

export default router;
