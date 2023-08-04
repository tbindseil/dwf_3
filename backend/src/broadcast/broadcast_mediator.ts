import Client from './client';
import BroadcastClientFactory from './broadcast_client';
import PictureSyncClientFactory from './picture_sync_client';
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

interface TrackedPicture {
    idToClientMap: Map<string, Client>;
    dirty: boolean;
    raster: Raster;
}

export default class BroadcastMediator {
    private static readonly PICTURE_SYNC_KEY = 'PICTURE_SYNC_KEY';

    private readonly pictureAccessor: PictureAccessor;
    private readonly broadcastClientFactory: BroadcastClientFactory;
    private readonly pictureSyncClientFactory: PictureSyncClientFactory;

    // this maps filename to all clients, where each client has a unique socket id to fetch instantly
    private readonly filenameToClients: Map<string, TrackedPicture>;

    constructor(
        pictureAccessor: PictureAccessor,
        broadcastClientFactory: BroadcastClientFactory,
        pictureSyncClientFactory: PictureSyncClientFactory
    ) {
        this.filenameToClients = new Map();

        this.pictureAccessor = pictureAccessor;
        this.broadcastClientFactory = broadcastClientFactory;
        this.pictureSyncClientFactory = pictureSyncClientFactory;

        const interval = setInterval(() => {
            this.filenameToClients.forEach((trackedPicture: TrackedPicture) => {
                if (trackedPicture.dirty) {
                    pictureAccessor.writeRaster(trackedPicture.raster);

                    // no need to worry about edge case where an update (specifically the last one) comes between write and
                    // dirty being cleared. in that case, the client will be removed and a final write will occur
                    // TODO make sure that the write upon last client removal isn't done until all updates are processed
                    trackedPicture.dirty = false;
                }
            });
        }, 30);

        // one timer for lifetime of broacast_client
        // no need to close because broadcast_client is a singleton
        interval;
    }

    // TODO type alias for Socket<Cli....
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
            const rasterObject = await this.pictureAccessor.getRaster(filename);
            const raster = new Raster(
                rasterObject.width,
                rasterObject.height,
                rasterObject.data
            );
            const m = new Map();
            m.set(
                BroadcastMediator.PICTURE_SYNC_KEY,
                this.pictureSyncClientFactory.createPictureSyncClient(
                    this.pictureAccessor,
                    raster
                )
            );

            this.filenameToClients.set(filename, {
                idToClientMap: m,
                dirty: false,
                // as long as this is ultimately written to after all updates are received,
                // its not important for it to be written to after each update
                raster: raster,
            });
        }

        const clientMap = this.filenameToClients.get(filename);
        if (clientMap) {
            clientMap.idToClientMap.set(
                socket.id,
                // TODO do I still need these factories?
                this.broadcastClientFactory.createBroadcastClient(socket)
            );
        }
    }

    // first, remove the client that is disconnecting
    // then, if only one client left,
    // make sure its the broadcast client and remove that
    //
    // revisiting, this can be done much cleaner using the features of socket.io
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
            // TODO why did this (or the next one) get hit when using web page?
            // throw new Error(`unable to remove socket id ${socket.id} because client map for filename ${filename} doesn't exist`);
            console.log(
                `unable to remove socket id ${socket.id} because client map for filename ${filename} doesn't exist`
            );
            return;
        }

        const trackedPicture = this.filenameToClients.get(filename);

        if (trackedPicture) {
            if (!trackedPicture.idToClientMap.has(socket.id)) {
                // throw new Error(`unable to remove socket id ${socket.id} because it doesn't exist in client map for filename ${filename}`);
                console.log(
                    `unable to remove socket id ${socket.id} because it doesn't exist in client map for filename ${filename}`
                );
                return;
            }

            const idToClientMap = trackedPicture.idToClientMap;
            idToClientMap.delete(socket.id);
            if (Array.from(idToClientMap.keys()).length === 1) {
                if (idToClientMap.has(BroadcastMediator.PICTURE_SYNC_KEY)) {
                    // TODO make sure that the write upon last client removal isn't done until all updates are processed
                    this.pictureAccessor.writeRaster(trackedPicture.raster);

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
            trackedPicture.idToClientMap.forEach((client) =>
                // TODO hmm, maybe if I wait here, I will know that the write happened before setting to dirty
                client.handleUpdate(pixelUpdate, sourceSocketId)
            );
            trackedPicture.dirty = true;
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
