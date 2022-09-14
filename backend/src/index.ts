import * as http from 'http'
import API from './handlers/api';
import BroadcastMediator from './broadcast/broadcast_mediator';
import LocalPictureAccessor from './picture_accessor/local_picture_accessor';
import Router from './router'

import {
    GetPictures,
    GetPicture,
    PostPicture,
    PutClient,
    DeleteClient,
    PostUpdate,
} from './handlers/index';

const baseDirectory = '/Users/tj/Projects/dwf_3/pictures/user_created/';
const prototypeFileName = '/Users/tj/Projects/dwf_3/pictures/default/solid_white.png';

const pictureAccessor = new LocalPictureAccessor(prototypeFileName, baseDirectory);

const broadcastMediator = new BroadcastMediator();

const router = new Router();
const apis = [
    new GetPictures(),
    new GetPicture(pictureAccessor),
    new PostPicture(pictureAccessor),
    new PutClient(broadcastMediator),
    new DeleteClient(),
    new PostUpdate()
];
apis.forEach((a: API) => { router.add_method(a) });

const server = http.createServer(function (req: any, res: any) {
    console.log(`${req.method} request received at ${req.url}`);

    router.route(req, res);
});

server.listen(8080, function () {
    console.log('Listening on port http://localhost:8080');
});
