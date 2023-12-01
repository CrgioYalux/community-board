import http from 'http';
import express from 'express';

const app = express();

app.get('/ping', (_, res) => {
    res.status(200).send('pong');
    return;
});

const port = process.env.PORT || 4000;
const server = http.createServer(app);

server.listen(port, () => {
    console.log(`listening on port: ${port}`);
});
