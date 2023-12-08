import cors from 'cors';
import express from 'express';

import API from './API';
import Middleware from './middleware';

function create() {
    const app = express();

    app.disable('x-powered-by');
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(cors());

    // API request handling pipeline
   
    app.use(Middleware.Logs);
    
    // Unauthed routes
    app.use(API.Router.Pong);
    app.use(API.Router.Auth.NonAuthenticated);
    
    app.use(Middleware.Auth);
    
    // Authed routes
    app.use(API.Router.Auth.Authenticated);
    app.use(API.Router.Members);
    app.use(API.Router.Affiliates);
    app.use(API.Router.Followers);
    app.use(API.Router.Posts);
    
    app.use(Middleware.ErrorHandling);
    app.use(Middleware.NotFound);

    return app;
};

const app = { create };

export default app;
