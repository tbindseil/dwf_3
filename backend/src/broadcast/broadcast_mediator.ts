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
import ClientInitalizationClient from './client_initialization_client';

interface TrackedPicture {
    idToClientMap: Map<string, Client>;
    pictureSyncClient: PictureSyncClient;
}

// TJTAG these actions all need to be syncrhonied, basically serialized
// and that queue in psc makes things way harder..
//
// i mean the queue actually solves a purpose
//
// there's another note that outlines the utiltiy of the queue
//
// but I still need to figure out:
//
// TODO how are asynchronous socket event handlers dealt with?
// - I think what is happening is the `await`s in the handlers
// relinquish control, and then we have another event coming in
// and doing things
// -- so thats a problem

// maybe i could do an initialization mediator
// naw too much overlap

export default class BroadcastMediator {
    private static readonly PICTURE_SYNC_KEY = 'PICTURE_SYNC_KEY';

    private readonly pictureAccessor: PictureAccessor;

    // this maps filename to all clients, where each client has a unique socket id to fetch instantly
    private readonly filenameToClients: Map<string, TrackedPicture>;

    constructor(pictureAccessor: PictureAccessor) {
        this.filenameToClients = new Map();

        this.pictureAccessor = pictureAccessor;
    }

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

            // actually, by the same logic as below, this should be after setting up the clients
            // but the picture sync client needs the raster!
            // TODO, instead of giving the raster to the picturesyncclient on consturction
            // lets have that happen via the cic
//            const rasterObject = await this.pictureAccessor.getRaster(filename);
//            const raster = new Raster(
//                rasterObject.width,
//                rasterObject.height,
//                rasterObject.data
//            );

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
            const clientInitalizationClient = new ClientInitalizationClient(new Queue(), socket);

            trackedClient.idToClientMap.set(socket.id, broadcastClient);
            trackedClient.idToClientMap.set(socket.id, clientInitalizationClient);

            // I think I want to only relinquish control AFTER setting the client map up to receive future events
            if (trackedClient.idToClientMap.size === 3) {
                // then this is the first client added, and we need to initialize the psc
                await pictureSyncClient.initialize();
            }

            await clientInitalizationClient.initialize(broadcastClient, pictureSyncClient);
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
