import express, { Express, Request, Response } from 'express';
import http from 'http';
import {Server, Socket} from 'socket.io';

import BroadcastMediator from './broadcast/broadcast_mediator';
import LocalPictureAccessor from './picture_accessor/local_picture_accessor';
import JimpAdapterImpl from './picture_accessor/jimp_adapter';
import { pictureRequestHandler, updateHandler } from './socket_functions';

import {
    GetPictures,
    GetPicture,
    PostPicture,
    PostUpdate,
} from './handlers/index';

import { PictureRequest, PixelUpdate } from 'dwf-3-models-tjb';
import { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from 'dwf-3-models-tjb';

const app: Express = express();


const baseDirectory = '/Users/tj/Projects/dwf_3/pictures/user_created/';
const prototypeFileName = '/Users/tj/Projects/dwf_3/pictures/default/sample_1000_1619.png';
const jimpAdapter = new JimpAdapterImpl();
const pictureAccessor = new LocalPictureAccessor(jimpAdapter, prototypeFileName, baseDirectory);

const broadcastMediator = new BroadcastMediator(pictureAccessor);

// TODO db should be injected below

app.get('pictures', async (req: Request, res: Response) => {
    new GetPictures().call(req, res);
});

app.get('picture', (req: Request, res: Response) => {
    new GetPicture(pictureAccessor).call(req, res);
});

app.post('picture', (req: Request, res: Response) => {
    new PostPicture(pictureAccessor).call(req, res);
});

app.get('update', (req: Request, res: Response) => {
    new PostUpdate().call(req, res);
});


const server: http.Server = http.createServer(app);
const port = process.env.PORT || 8080;

const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
    cors: {
        origin: 'http://localhost:3000', // wtf, why is this the address of the web page?
        methods: ["GET", "POST"]
    }
});
io.on('connection', (socket: Socket) => {
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

server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
