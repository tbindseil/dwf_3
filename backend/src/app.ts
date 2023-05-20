import express, { Express, Request, Response } from "express";
import cors from "cors";
import http from "http";
import { Server, Socket } from "socket.io";

import BroadcastMediator from "./broadcast/broadcast_mediator";
import LocalPictureAccessor from "./picture_accessor/local_picture_accessor";
import JimpAdapterImpl from "./picture_accessor/jimp_adapter";

import { makeKnex } from "./db/knex_file";
import { DB } from "./db";
import {
  GetPictures,
  GetPicture,
  PostPicture,
  PostUpdate,
} from "./handlers/index";

import { pictureRequestHandler, updateHandler } from "./socket_functions";

import {
  PictureRequest,
  PixelUpdate,
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from "dwf-3-models-tjb";

import BroadcastClientFactory from "./broadcast/broadcast_client";
import PictureSyncClientFactory from "./broadcast/picture_sync_client";

// TODO handle api errors specifically
const app: Express = express();

// use cors accross all routes
app.use(cors());

// decode json request bodies
app.use(express.json());

const baseDirectory = "/Users/tj/Projects/dwf_3/pictures/user_created/";
const prototypeFileName =
  "/Users/tj/Projects/dwf_3/pictures/default/sample_1000_1619.png";
const jimpAdapter = new JimpAdapterImpl();
const pictureAccessor = new LocalPictureAccessor(
  jimpAdapter,
  prototypeFileName,
  baseDirectory
);
const pictureSyncClientFactory = new PictureSyncClientFactory();
const broadcastClientFactory = new BroadcastClientFactory();

const broadcastMediator = new BroadcastMediator(
  pictureAccessor,
  broadcastClientFactory,
  pictureSyncClientFactory
);

// TODO inject db (and pictureArray?) via middleware
const db = new DB(makeKnex);

app.get("/pictures", async (req: Request, res: Response) => {
  new GetPictures(db).call(req, res);
});
app.get("/picture", (req: Request, res: Response) => {
  new GetPicture(db, pictureAccessor).call(req, res);
});
app.post("/picture", (req: Request, res: Response) => {
  new PostPicture(db, pictureAccessor).call(req, res);
});
app.get("/update", (req: Request, res: Response) => {
  new PostUpdate(db).call(req, res);
});

export const server: http.Server = http.createServer(app);

export const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
io.on("connection", (socket: Socket) => {
  // TODO make event names constants and share accross frontend and backend
  socket.on("picture_request", async (pictureRequest: PictureRequest) => {
    pictureRequestHandler(
      pictureRequest,
      broadcastMediator,
      pictureAccessor,
      socket
    );
  });
  socket.on("client_to_server_udpate", (pixelUpdate: PixelUpdate) => {
    updateHandler(pixelUpdate, broadcastMediator, socket.id);
  });

  socket.on("unsubscribe", (filename: string) => {
    console.log(
      `socket unsubscribe. Socket id: ${socket.id} and filename: ${filename}`
    );
    broadcastMediator.removeClient(filename, socket);
  });
});
