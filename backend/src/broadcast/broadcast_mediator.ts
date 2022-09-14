import Client from './client';
import BroadcastClient from './broadcast_client';
import PictureSyncClient from './picture_sync_client';

export default class BroadcastMediator {
    private readonly clients: Map<string, Set<Client>>;

    constructor() {
        this.clients = new Map();
    }

    public addClient(pictureId: string, ipAddress: string) {
        if (!this.clients.has(pictureId)) {
            this.clients.set(pictureId, new Set());
            this.clients.get(pictureId)!.add(new PictureSyncClient(pictureId));
        }

        this.clients.get(pictureId)!.add(new BroadcastClient(ipAddress));
    }
}
