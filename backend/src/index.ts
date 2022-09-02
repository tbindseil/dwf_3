import * as http from 'http'
import API from './handlers/api';
import Router from './router'

import {
    GetPictures,
    PostPicture,
    PutClient,
    DeleteClient,
    PostUpdate,
} from './handlers/index';


const router = new Router();
const apis = [new GetPictures(), new PostPicture(), new PutClient(), new DeleteClient(), new PostUpdate()];
apis.forEach((a: API) => { router.add_method(a) });


// after testing the routing logic, I should be able to write
// integration tests that hit this server and make sure it works
const server = http.createServer(function (req: any, res: any) {
    console.log(`${req.method} request received at ${req.url}`);

    res.statusCode = 200; // 200 = OK
    res.setHeader('Content-Type', 'application/json');

    router.route(req, res);
});

server.listen(8080, function () {
    console.log('Listening on port http://localhost:8080');
});
