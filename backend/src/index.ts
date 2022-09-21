import * as http from 'http'
import { Server } from 'socket.io';
import API from './handlers/api';
import BroadcastMediator from './broadcast/broadcast_mediator';
import LocalPictureAccessor from './picture_accessor/local_picture_accessor';
import Router from './router'
import { pictureRequestHandler } from './socket_functions';

import {
    GetPictures,
    GetPicture,
    PostPicture,
    PostUpdate,
} from './handlers/index';

import { PictureRequest } from 'dwf-3-models-tjb';
import { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from 'dwf-3-models-tjb';

const baseDirectory = '/Users/tj/Projects/dwf_3/pictures/user_created/';
const prototypeFileName = '/Users/tj/Projects/dwf_3/pictures/default/solid_white.png';

const pictureAccessor = new LocalPictureAccessor(prototypeFileName, baseDirectory);

const broadcastMediator = new BroadcastMediator(pictureAccessor);

const router = new Router();
const apis = [
    new GetPictures(),
    new GetPicture(pictureAccessor),
    new PostPicture(pictureAccessor),
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

const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
    cors: {
        origin: 'http://localhost:3000', // wtf, why is this the address of the web page?
        methods: ["GET", "POST"]
    }
});
io.on('connection', (socket) => {
    socket.on('picture_request', async (pictureRequest: PictureRequest) => {
        pictureRequestHandler(pictureRequest, broadcastMediator, pictureAccessor, socket);
    });
});
io.listen(6543);
