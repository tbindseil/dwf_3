import Client from './client';
import BroadcastClient from './broadcast_client';
import PictureSyncClient from './picture_sync_client';
import PictureAccessor from '../picture_accessor/picture_accessor';

import { Socket } from 'socket.io';
import {
    PixelUpdate,
    ServerToClientEvents,
    ClientToServerEvents,
    InterServerEvents,
    SocketData
} from 'dwf-3-models-tjb';
import { Raster } from 'dwf-3-raster-tjb';


export default class BroadcastMediator {
    private readonly clients: Map<string, Set<Client>>;
    private readonly pictureAccessor: PictureAccessor;

    constructor(pictureAccessor: PictureAccessor) {
        this.clients = new Map();
        this.pictureAccessor = pictureAccessor;
    }

    public async addClient(filename: string, socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) {
        if (!this.clients.has(filename)) {
            this.clients.set(filename, new Set());
            const rasterObject = await this.pictureAccessor.getRaster(filename);
            const raster = new Raster(rasterObject.width, rasterObject.height, rasterObject.data);
            this.clients.get(filename)!.add(new PictureSyncClient(filename, this.pictureAccessor, raster));
        }

        this.clients.get(filename)!.add(new BroadcastClient(socket));
    }

    public async removeClient(socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>): void {
        // TODO how to take in socket (it has an id)
        // and find the BOTH the picture (ie filename) and the client (socket id) to remove
        //
        //
    }

    public handleUpdate(pixelUpdate: PixelUpdate, sourceSocketId: string) {
        // i think this still gets fucked up with locking and stuff

        this.clients.get(pixelUpdate.filename)?.forEach(client => client.handleUpdate(pixelUpdate, sourceSocketId));
    }
}
