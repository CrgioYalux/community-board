import express from 'express';

import { ROUTE } from '../route';
import Handler from '../handler';

const router = express.Router();

router.get(ROUTE.MEMBERS.GET, Handler.Members.Get);
router.get(ROUTE.MEMBERS.GET_BY_ID, Handler.Members.GetByID);
router.get(
	ROUTE.MEMBERS.GET_FROM_MEMBER_POV_BY_USERNAME,
	Handler.Members.GetFromMemberPovByUsername
);
router.delete(ROUTE.MEMBERS.DELETE, Handler.Members.Delete);
router.patch(ROUTE.MEMBERS.PATCH, Handler.Members.Patch);

export default router;
