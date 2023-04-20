import * as http from 'http'
import { Server } from 'socket.io';
import API from './handlers/api';
import BroadcastMediator from './broadcast/broadcast_mediator';
import LocalPictureAccessor from './picture_accessor/local_picture_accessor';
import Router from './router'
import { pictureRequestHandler, updateHandler } from './socket_functions';

import {
    GetPictures,
    GetPicture,
    PostPicture,
    PostUpdate,
} from './handlers/index';

import { PictureRequest, PixelUpdate } from 'dwf-3-models-tjb';
import { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from 'dwf-3-models-tjb';

const baseDirectory = '/Users/tj/Projects/dwf_3/pictures/user_created/';
const prototypeFileName = '/Users/tj/Projects/dwf_3/pictures/default/sample_1000_1619.png';

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



    const headers = {
        'Access-Control-Allow-Origin': '*', /* @dev First, read about security */
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET, PUT',
        'Access-Control-Max-Age': 2592000, // 30 days
        'Access-Control-Allow-Headers': 'Content-Type'
        /** add other headers as per requirement */
    };

    if (req.method === 'OPTIONS') {
        res.writeHead(204, headers);
        res.end();
        return;
    }

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
    socket.on('client_to_server_udpate', (pixelUpdate: PixelUpdate) => {
        updateHandler(pixelUpdate, broadcastMediator, socket.id);
    });

    socket.on('unsubscribe', (filename: string) => {
        console.log(`socket unsubscribe. Socket id: ${socket.id} and filename: ${filename}`);
        broadcastMediator.removeClient(filename, socket);
    });
});
io.listen(6543);
