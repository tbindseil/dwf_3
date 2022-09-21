import Client from './client';
import BroadcastClient from './broadcast_client';
import PictureSyncClient from './picture_sync_client';
import PictureAccessor from '../picture_accessor/picture_accessor';

import { Socket } from 'socket.io';
import {
    Update,
    ServerToClientEvents,
    ClientToServerEvents,
    InterServerEvents,
    SocketData
} from 'dwf-3-models-tjb';


export default class BroadcastMediator {
    private readonly clients: Map<string, Set<Client>>;
    private readonly pictureAccessor: PictureAccessor;

    constructor(pictureAccessor: PictureAccessor) {
        this.clients = new Map();
        this.pictureAccessor = pictureAccessor;
    }

    public addClient(filename: string, socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) {
        if (!this.clients.has(filename)) {
            this.clients.set(filename, new Set());
            this.clients.get(filename)!.add(new PictureSyncClient(filename, this.pictureAccessor));
        }

        this.clients.get(filename)!.add(new BroadcastClient(socket));
    }

    public handleUpdate(update: Update) {
        // i think this still gets fucked up with locking and stuff

        const filename = update.filename;
        this.clients.get(filename)?.forEach(client => client.handleUpdate(update));
    }
}
