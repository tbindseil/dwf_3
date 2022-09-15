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

    public addClient(pictureId: string, ipAddress: string) {
        if (!this.clients.has(pictureId)) {
            this.clients.set(pictureId, new Set());
            this.clients.get(pictureId)!.add(new PictureSyncClient(pictureId, this.pictureAccessor));
        }

        this.clients.get(pictureId)!.add(new BroadcastClient(ipAddress));
    }

    public handleUpdate(update: Update) {
        // i think this still gets fucked up with locking and stuff

        const pictureId = update.pictureId;
        this.clients.get(pictureId)?.forEach(client => client.handleUpdate(update));
    }
}
