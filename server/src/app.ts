import cors from 'cors';
import express from 'express';

import API from './API';
import Middlewares from './middlewares';

function create() {
    const app = express();

    app.disable('x-powered-by');
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(cors());

    // API request handling pipeline
   
    app.use(Middlewares.Logs);
    
    // // Unauthed routes
    app.use(API.Router.Pong);
    //
    // app.use(Middlewares.Auth);
    //
    // // Authed routes
    // app.use(API.Router.Members);
    // app.use(API.Router.Posts);
    
    app.use(Middlewares.ErrorHandling);
    app.use(Middlewares.NotFound);

    return app;
};

const app = { create };

export default app;
