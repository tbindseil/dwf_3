import express, { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import http from 'http';

import BroadcastMediator from './broadcast/broadcast_mediator';
import LocalPictureAccessor from './picture_accessor/local_picture_accessor';
import JimpAdapterImpl from './picture_accessor/jimp_adapter';

import { GetPictures, PostPicture, PostUpdate } from './handlers/index';

import { pictureRequestHandler, updateHandler } from './socket_functions';

import {
    PictureRequest,
    PixelUpdate,
    Picture,
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData,
} from 'dwf-3-models-tjb';

import { myErrorHandler } from './middleware/error_handler';
import { makeKnex } from './db/knex_file';
import { Server, Socket } from 'socket.io';

// I either need to:
// 1. save knex and destroy it on shutdown
// 2. provide knex to each request and destroy it at the end
// 3. that's easy to do in api

Picture.knex(makeKnex());

Picture.knex().destroy();

const app: Express = express();

// use cors accross all routes
app.use(cors());

// decode json request bodies
app.use(express.json());

const baseDirectory = '/Users/tj/Projects/dwf_3/pictures/user_created/';
const prototypeFileName =
    '/Users/tj/Projects/dwf_3/pictures/default/sample_1000_1619.png';
const jimpAdapter = new JimpAdapterImpl();
const pictureAccessor = new LocalPictureAccessor(
    jimpAdapter,
    prototypeFileName,
    baseDirectory
);

const broadcastMediator = new BroadcastMediator(pictureAccessor);

// TODO inject -db- (and pictureArray? and ajv?) via middleware
app.get('/pictures', (req: Request, res: Response, next: NextFunction) => {
    new GetPictures().call(req, res, next);
});
app.post('/picture', (req: Request, res: Response, next: NextFunction) => {
    new PostPicture(pictureAccessor).call(req, res, next);
});
app.post('/update', (req: Request, res: Response, next: NextFunction) => {
    new PostUpdate().call(req, res, next);
});

app.use(myErrorHandler);

export const server: http.Server = http.createServer(app);

export const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});
io.on(
    'connection',
    (
        socket: Socket<
            ClientToServerEvents,
            ServerToClientEvents,
            InterServerEvents,
            SocketData
        >
    ) => {
        console.log(`io.on connection and socket.id is: ${socket.id}`);
        socket.on('picture_request', async (pictureRequest: PictureRequest) => {
            pictureRequestHandler(
                pictureRequest,
                broadcastMediator,
                pictureAccessor,
                socket
            );
        });
        socket.on('client_to_server_udpate', (pixelUpdate: PixelUpdate) => {
            updateHandler(pixelUpdate, broadcastMediator, socket.id);
        });

        socket.on('unsubscribe', (filename: string) => {
            console.log(
                `socket unsubscribe. Socket id: ${socket.id} and filename: ${filename}`
            );
            broadcastMediator.removeClient(filename, socket);
        });
    }
);
