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
import { Raster } from 'dwf-3-raster-tjb';
import { Socket } from 'socket.io';
import { Queue } from './queue';

interface TrackedPicture {
    idToClientMap: Map<string, Client>;
    raster: Raster;
}

// TJTAG these actions all need to be syncrhonied, basically serialized
// and that queue in psc makes things way harder..
//
//

export default class BroadcastMediator {
    private static readonly PICTURE_SYNC_KEY = 'PICTURE_SYNC_KEY';

    private readonly pictureAccessor: PictureAccessor;

    // this maps filename to all clients, where each client has a unique socket id to fetch instantly
    private readonly filenameToClients: Map<string, TrackedPicture>;

    constructor(pictureAccessor: PictureAccessor) {
        this.filenameToClients = new Map();

        this.pictureAccessor = pictureAccessor;
    }

    // TODO mechanism to know a new client will always receive all updates from after the raster is given to them
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

        const rasterObject = await this.pictureAccessor.getRaster(filename);
        const raster = new Raster(
            rasterObject.width,
            rasterObject.height,
            rasterObject.data
        );

        if (!this.filenameToClients.has(filename)) {
            console.log('TJTAG start of if');
            this.filenameToClients.forEach(
                (value: TrackedPicture, key: string) =>
                    console.log(`TJTAG key: ${key} and value: ${value}`)
            );
            // hmmm, seems like we would also have to create a new file if this doesnt exist, or probably throw
            const m = new Map();
            m.set(
                BroadcastMediator.PICTURE_SYNC_KEY,
                new PictureSyncClient(
                    new Queue(),
                    this.pictureAccessor,
                    raster,
                    filename
                )
            );

            this.filenameToClients.set(filename, {
                idToClientMap: m,
                raster: raster,
            });
            console.log('TJTAG just set');
            this.filenameToClients.forEach(
                (value: TrackedPicture, key: string) =>
                    console.log(`TJTAG key: ${key} and value: ${value}`)
            );
        } else {
            console.log('ELSE???');
        }

        const clientMap = this.filenameToClients.get(filename);
        if (clientMap) {
            clientMap.idToClientMap.set(socket.id, new BroadcastClient(socket));
        }

        // is this a deep copy?
        socket.emit('join_picture_response', rasterObject);
    }

    // first, remove the client that is disconnecting
    // then, if only one client left,
    // make sure its the broadcast client and remove that
    //
    // revisiting, this can be done much cleaner using the features of socket.io
    // damn
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
        // i think this still gets fucked up with locking and stuff
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
