import express, { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import http from 'http';

import BroadcastMediator from './broadcast/broadcast_mediator';
import LocalPictureAccessor from './picture_accessor/local_picture_accessor';
import JimpAdapterImpl from './picture_accessor/jimp_adapter';

import { GetPictures, PostPicture, PostUpdate } from './handlers/index';

import {
    JoinPictureRequest,
    PixelUpdate,
    Picture,
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData,
    LeavePictureRequest,
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

// the connectionConfigWithoutDatabase thing
// has a to do in api.test.ts
const baseDirectory = '/Users/tj/Projects/dwf_3/pictures/user_created/';
const configureableAdditionalDirectory =
    process.env.ENV && process.env.ENV === 'TEST'
        ? `${baseDirectory}test/`
        : baseDirectory;
const jimpAdapter = new JimpAdapterImpl();
const pictureAccessor = new LocalPictureAccessor(
    jimpAdapter,
    configureableAdditionalDirectory
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
        console.log(`TJTAG - io.on connection and socket.id is: ${socket.id}`);
        // TJTAG there is a race condition here,
        // were not done joining when we get a leave
        //
        // tough one
        //
        // so,
        socket.on(
            'join_picture_request',
            async (joinPictureRequest: JoinPictureRequest) => {
                console.log('TJTAG start joinPictureRequest');
                await broadcastMediator.addClient(
                    joinPictureRequest.filename,
                    socket
                );
                console.log('TJTAG end joinPictureRequest');
            }
        );
        socket.on('client_to_server_udpate', (pixelUpdate: PixelUpdate) => {
            broadcastMediator.handleUpdate(pixelUpdate, socket.id);
        });

        socket.on(
            'leave_picture_request',
            (leavePictureRequest: LeavePictureRequest) => {
                console.log('TJTAG start leavePictureRequest');
                broadcastMediator.removeClient(
                    leavePictureRequest.filename,
                    socket
                );
                console.log('TJTAG end leavePictureRequest');
            }
        );

        socket.on('unsubscribe', (filename: string) => {
            console.log(
                `socket unsubscribe. Socket id: ${socket.id} and filename: ${filename}`
            );
            // now explicitly requested
            // broadcastMediator.removeClient(filename, socket);
        });
    }
);
