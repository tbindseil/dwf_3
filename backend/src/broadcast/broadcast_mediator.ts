import Client from './client';
import BroadcastClient from './broadcast_client';
import PictureSyncClient from './picture_sync_client';
import PictureAccessor from '../picture_accessor/picture_accessor';
import { Update } from 'dwf-3-models-tjb';


export default class BroadcastMediator {
    private readonly clients: Map<string, Set<Client>>;
    private readonly pictureAccessor: PictureAccessor;

    constructor(pictureAccessor: PictureAccessor) {
        this.clients = new Map();
        this.pictureAccessor = pictureAccessor;
    }

    public addClient(filename: string, ipAddress: string) {
        if (!this.clients.has(filename)) {
            this.clients.set(filename, new Set());
            this.clients.get(filename)!.add(new PictureSyncClient(filename, this.pictureAccessor));
        }

        this.clients.get(filename)!.add(new BroadcastClient(ipAddress));
    }

    public handleUpdate(update: Update) {
        // i think this still gets fucked up with locking and stuff

        const filename = update.filename;
        this.clients.get(filename)?.forEach(client => client.handleUpdate(update));
    }
}
