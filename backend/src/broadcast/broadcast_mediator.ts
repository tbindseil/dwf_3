import Client from './client';
import { BroadcastClient } from './broadcast_client';
import { PictureSyncClient } from './picture_sync_client';
import PictureAccessor from '../picture_accessor/picture_accessor';

import {
    ClientToServerEvents,
    InterServerEvents,
    PixelUpdate,
    ServerToClientEvents,
    SocketData,
} from 'dwf-3-models-tjb';
import { Socket } from 'socket.io';
import { Queue } from './queue';

interface TrackedPicture {
    idToClientMap: Map<string, Client>;
    pictureSyncClient: PictureSyncClient;
}

export default class BroadcastMediator {
    private static readonly PICTURE_SYNC_KEY = 'PICTURE_SYNC_KEY';

    private readonly pictureAccessor: PictureAccessor;

    // this maps filename to all clients, where each client has a unique socket id to fetch instantly
    private readonly filenameToClients: Map<string, TrackedPicture>;

    constructor(pictureAccessor: PictureAccessor) {
        this.filenameToClients = new Map();

        this.pictureAccessor = pictureAccessor;
    }

    // first, we setup the new clients in the TrackedPicture map,
    // then we do asynchronous setup things
    // that way, if the picture gets an update while the async stuff is happening
    // we will be able to still pass the new update to the clients registering in
    // this iteration of the function.
    public async addClient(
        filename: string,
        socket: Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
        >
    ): Promise<void> {
        console.log(
            `adding client, filename: ${filename} and socket id: ${socket.id}`
        );


        if (!this.filenameToClients.has(filename)) {
            // hmmm, seems like we would also have to create a new file if this doesnt exist, or probably throw
            const pictureSyncClient = new PictureSyncClient(
                new Queue(),
                this.pictureAccessor,
                filename
            );
            const m = new Map();
            m.set(
                BroadcastMediator.PICTURE_SYNC_KEY,
                pictureSyncClient
            );

            this.filenameToClients.set(filename, {
                idToClientMap: m,
                pictureSyncClient: pictureSyncClient
            });
        }


        const trackedClient = this.filenameToClients.get(filename);
        if (trackedClient) {
            const pictureSyncClient = trackedClient.pictureSyncClient;

            const broadcastClient = new BroadcastClient(socket);

            trackedClient.idToClientMap.set(socket.id, broadcastClient);

            // I think I want to only relinquish control AFTER setting the client map up to receive future events
            if (trackedClient.idToClientMap.size === 3) {
                // then this is the first client added, and we need to initialize the psc
                await pictureSyncClient.initialize();
            }

            // this is needed becasue we can receive updates while the psc is initializing above
            // the psc buffers those, and can provide us with a snapshot of the raster and the updates that
            // have been received but havent been applied. then, we send the snapshot and all pending updates
            // and get broadcast client to start receiving new udpates, all without awaiting
            //
            // this could also be accomplished by not adding the broadcastClient to the map until we finish these
            // pending updates
            const [lastWrittenRasterCopy, pendingUpdates] = pictureSyncClient.getLastWrittenRasterCopy();
            socket.emit('join_picture_response', lastWrittenRasterCopy.toJoinPictureResponse());
            pendingUpdates.forEach(u => socket.emit('server_to_client_update', u));
            broadcastClient.notifySynchronized();
        }
    }

    public removeClient(
        filename: string,
        socket: Socket<
            ClientToServerEvents,
            ServerToClientEvents,
            InterServerEvents,
            SocketData
        >
    ): void {
        console.log(
            `remove client, filename: ${filename} and socket id: ${socket.id}`
        );

        if (!this.filenameToClients.has(filename)) {
            // this is happening due to a race conition where we leave immediately after joining
            // that shouldn't happen, but if it does it leaves a socket unclean
            // but the socket ultimately closes
            console.error(
                `unable to remove socket id ${socket.id} because client map for filename ${filename} doesn't exist`
            );
            return;
        }

        const trackedPicture = this.filenameToClients.get(filename);

        if (trackedPicture) {
            const clientToDelete = trackedPicture.idToClientMap.get(socket.id);
            if (!clientToDelete) {
                // same thing as above, except on second and on clients
                //
                // this is happening due to a race conition where we leave immediately after joining
                // that shouldn't happen, but if it does it leaves a socket unclean
                // but the socket ultimately closes
                console.error(
                    `unable to remove socket id ${socket.id} because it doesn't exist in client map for filename ${filename}`
                );
                return;
            }

            clientToDelete.close();
            const idToClientMap = trackedPicture.idToClientMap;
            idToClientMap.delete(socket.id);

            if (Array.from(idToClientMap.keys()).length === 1) {
                const pictureSyncClient = idToClientMap.get(
                    BroadcastMediator.PICTURE_SYNC_KEY
                );
                if (pictureSyncClient) {
                    pictureSyncClient.close();
                    idToClientMap.delete(BroadcastMediator.PICTURE_SYNC_KEY);
                    this.filenameToClients.delete(filename);
                } else {
                    throw new Error(
                        `heads up, last client for filename: ${filename} is not the broadcast client`
                    );
                }
            }
        }
    }

    public handleUpdate(pixelUpdate: PixelUpdate, sourceSocketId: string) {
        const filename = pixelUpdate.filename;

        const trackedPicture = this.filenameToClients.get(filename);

        if (trackedPicture) {
            trackedPicture.idToClientMap.forEach(
                (client: Client, socketId: string) => {
                    if (socketId != sourceSocketId) {
                        client.handleUpdate(pixelUpdate);
                    }
                }
            );
        }
    }

    public listClients(filename: string): string[] {
        if (!this.filenameToClients.has(filename)) {
            return [];
        }
        const clientsMap = this.filenameToClients.get(filename)
            ?.idToClientMap as Map<string, Client>;
        return Array.from(clientsMap.keys());
    }
}
