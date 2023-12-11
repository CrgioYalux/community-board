import express from 'express';

import { ROUTE } from '../route';
import Handler from '../handler';

const Authenticated = express.Router();
const NonAuthenticated = express.Router();

NonAuthenticated.post(ROUTE.AUTH.LOGIN, Handler.Auth.Login);
NonAuthenticated.post(ROUTE.AUTH.REGISTER_MINIMAL, Handler.Auth.RegisterMinimal);
NonAuthenticated.post(ROUTE.AUTH.REGISTER_FULL, Handler.Auth.RegisterFull);
// router.post(ROUTE.AUTH.LOGOUT, Handler.Members.PostFull);
// router.post(ROUTE.AUTH.RESET_PASSWORD, Handler.Members.PostFull);
Authenticated.post(ROUTE.AUTH.REGISTER_DESCRIPTION, Handler.Auth.RegisterDescription);
Authenticated.post(ROUTE.AUTH.REAUTH, Handler.Auth.ReAuth);

const router = {
    Authenticated,
    NonAuthenticated,
};

export default router;
