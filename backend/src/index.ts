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

// now i have to connect to a database - TJTAG
// this will involve:
// 1. autogenerating database stuff based on models
// 2. connecting securely
//
// well, there are no good ORMs for typescript
//
// so what do i want it to do?
// given models (models/picture.ts for example):
// 1. I should be able to get the database looking right
// 1a. maybe just show differences?
// 2. I should be able to save and access objects, maybe autogenerate some basic queries
// 2a. nothing fancy, just get once and update on command
//
// connecting is a whole separate thing, that I probably should do first

const router = new Router();
const apis = [new GetPictures(), new PostPicture(), new PutClient(), new DeleteClient(), new PostUpdate()];
apis.forEach((a: API) => { router.add_method(a) });


// query
/* db.query('SELECT * FROM users WHERE id = $1', ['1'], (err: any, result: any) => {
    if (err) {
      console.log(`err is: ${err}`);
      return;
    }
    console.log(`result is: ${result}`);
    res.send(result.rows[0])
})*/





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
