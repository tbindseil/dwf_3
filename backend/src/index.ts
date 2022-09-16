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

const baseDirectory = '/Users/tj/Projects/dwf_3/pictures/user_created/';
const prototypeFileName = '/Users/tj/Projects/dwf_3/pictures/default/solid_white.png';

const pictureAccessor = new LocalPictureAccessor(prototypeFileName, baseDirectory);

const broadcastMediator = new BroadcastMediator(pictureAccessor);

// TODO i think i need to pass server instance of http.createserver into creation of io
const io = new Server({
    cors: {
        origin: 'http://localhost:3000', // wtf, why is this the address of the web page?
        methods: ["GET", "POST"]
    }
});
let interval: any;
io.on('connection', (socket) => {
    console.log(`on connection, and typeof socket is: ${typeof socket}`);
    if (interval) {
        clearInterval(interval);
    }
    interval = setInterval(() => getApiAndEmit(socket), 1000);
    socket.on("disconnect", () => {
        console.log("Client disconnected");
        clearInterval(interval);
    });
});
io.listen(6543);


const getApiAndEmit = (socket: any) => {
    const response = new Date();
    // Emitting a new message. Will be consumed by the client
    socket.emit("FromAP", response);
};

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
