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
    private static readonly PICTURE_SYNC_KEY = 'PICTURE_SYNC_KEY';

    private readonly pictureAccessor: PictureAccessor;

    // this maps filename to all clients, where each client has a unique socket id to fetch instantly
    private readonly filenameToClients: Map<string, Map<string, Client>>;

    constructor(pictureAccessor: PictureAccessor) {
        this.filenameToClients = new Map();
        this.pictureAccessor = pictureAccessor;
    }

    // TODO type alias for Socket<Cli....
    public async addClient(filename: string, socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>): Promise<void> {
        console.log(`adding client, filename: ${filename} and socket id: ${socket.id}`);

        if (!this.filenameToClients.has(filename)) {
            // hmmm, seems like we would also have to create a new file if this doesnt exist, or probably throw
            const rasterObject = await this.pictureAccessor.getRaster(filename);
            const raster = new Raster(rasterObject.width, rasterObject.height, rasterObject.data);
            const m = new Map();
            m.set(BroadcastMediator.PICTURE_SYNC_KEY, new PictureSyncClient(this.pictureAccessor, raster));

            this.filenameToClients.set(filename, m);
        }

        this.filenameToClients.get(filename)!.set(socket.id, new BroadcastClient(socket));
    }

    // first, remove the client that is disconnecting
    // then, if only one client left,
    // make sure its the broadcast client and remove that
    //
    // revisiting, this can be done much cleaner using the features of socket.io
    public removeClient(filename: string, socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>): void {
        console.log(`remove client, filename: ${filename} and socket id: ${socket.id}`);

        if (!this.filenameToClients.has(filename)) {
            throw new Error(`unable to remove socket id ${socket.id} because client map for filename ${filename} doesn't exist`);
        }

        if (!this.filenameToClients.get(filename)?.has(socket.id)) {
            throw new Error(`unable to remove socket id ${socket.id} because it doesn't exist in client map for filename ${filename}`);
        }

        // temporary to test saving of file
        this.filenameToClients.get(filename)?.get(BroadcastMediator.PICTURE_SYNC_KEY)?.forcePictureWrite();

        this.filenameToClients.get(filename)?.delete(socket.id);
        if (this.filenameToClients.get(filename)?.keys.length === 1) {
            if (this.filenameToClients.get(filename)?.has(BroadcastMediator.PICTURE_SYNC_KEY)) {
                this.filenameToClients.get(filename)?.delete(BroadcastMediator.PICTURE_SYNC_KEY);
                this.filenameToClients.delete(filename);
            } else {
                throw new Error(`heads up, last client for filename: ${filename} is not the broadcast client`);
            }
        }
    }

    public handleUpdate(pixelUpdate: PixelUpdate, sourceSocketId: string) {
        // i think this still gets fucked up with locking and stuff

        this.filenameToClients.get(pixelUpdate.filename)?.forEach(client => client.handleUpdate(pixelUpdate, sourceSocketId));
    }
}
