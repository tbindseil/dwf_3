import * as http from 'http'
import { Server } from 'socket.io';
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

import { PutClientInput } from 'dwf-3-models-tjb'; // TODO this and other socket stuff probably needs to be encapsulated
import { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from 'dwf-3-models-tjb';

const baseDirectory = '/Users/tj/Projects/dwf_3/pictures/user_created/';
const prototypeFileName = '/Users/tj/Projects/dwf_3/pictures/default/solid_white.png';

const pictureAccessor = new LocalPictureAccessor(prototypeFileName, baseDirectory);

const broadcastMediator = new BroadcastMediator(pictureAccessor);

// TODO i think i need to pass server instance of http.createserver into creation of io
const putClient = new PutClient(broadcastMediator);
const io = new Server<ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData>({
    cors: {
        origin: 'http://localhost:3000', // wtf, why is this the address of the web page?
        methods: ["GET", "POST"]
    }
});
io.on('connection', (socket) => {
    console.log(`on connection, and typeof socket is: ${typeof socket}`);
    socket.on('picture_request', async (pictureRequest: PutClientInput) => {
        // TODO what happens if I send a non conforming argument?
        // const pictureBuffer = putClient.process(pictureRequest);
        broadcastMediator.addClient(pictureRequest.filename, socket);
        const pictureBuffer = await pictureAccessor.getRaster(pictureRequest.filename);
        console.log('sending picture buffer');
        console.log(`pictureBuffer is: ${pictureBuffer}`);
        console.log(`stringified, it is: ${JSON.stringify(pictureBuffer)}`);
        socket.emit('picture_response', pictureBuffer);
    });
});
io.listen(6543);

const router = new Router();
const apis = [
    new GetPictures(),
    new GetPicture(pictureAccessor),
    new PostPicture(pictureAccessor),
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
