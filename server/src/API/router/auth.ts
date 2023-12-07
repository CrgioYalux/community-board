import express from 'express';

import { ROUTE } from '../route';
import Handler from '../handler';

const Authenticated = express.Router();
const NonAuthenticated = express.Router();

Authenticated.post(ROUTE.AUTH.LOGIN, Handler.Auth.Login);
Authenticated.post(ROUTE.AUTH.REGISTER_MINIMAL, Handler.Auth.RegisterMinimal);
Authenticated.post(ROUTE.AUTH.REGISTER_FULL, Handler.Auth.RegisterFull);
// router.post(ROUTE.AUTH.LOGOUT, Handler.Members.PostFull);
// router.post(ROUTE.AUTH.RESET_PASSWORD, Handler.Members.PostFull);
NonAuthenticated.post(ROUTE.AUTH.REGISTER_DESCRIPTION, Handler.Auth.RegisterDescription);

const router = {
    Authenticated,
    NonAuthenticated,
};

export default router;
