import Client from './client';
import { BroadcastClient } from './broadcast_client';
import PictureAccessor from '../picture_accessor/picture_accessor';

import {
    ClientToServerEvents,
    InterServerEvents,
    PixelUpdate,
    ServerToClientEvents,
    SocketData,
} from 'dwf-3-models-tjb';
import { Socket } from 'socket.io';
import { Priority, Queue } from './queue';
import {Raster} from 'dwf-3-raster-tjb';

interface TrackedPicture {
    idToClientMap: Map<string, Client>;
    dirty: boolean;
    raster?: Raster;

    // these are updates that have been broadcast but haven't been applied to the local copy of the raster
    pendingUpdates: PixelUpdate[];
}

export default class BroadcastMediator {
    private readonly pictureAccessor: PictureAccessor;
    private readonly queue: Queue;
    private readonly _writeInterval: NodeJS.Timer;

    // this maps filename to all clients, where each client has a unique socket id to fetch instantly
    private readonly trackedPictures = new Map<string, TrackedPicture>();

    private readonly ADD_CLIENT_PRIORITY = Priority.ONE;
    private readonly BROADCAST_UPDATE_PRIORITY = Priority.TWO;
    private readonly UPDATE_LOCAL_RASTER_PRIORITY = Priority.THREE;
    private readonly WRITE_RASTER_PRIORITY = Priority.FOUR;


    constructor(pictureAccessor: PictureAccessor, queue: Queue) {
        this.pictureAccessor = pictureAccessor;
        this.queue = queue;

        this._writeInterval = setInterval(() => {
            this.trackedPictures.forEach((tp, filename) => {
                queue.push(this.WRITE_RASTER_PRIORITY, async () => {
                    if (tp.raster && tp.dirty) {
                        await this.pictureAccessor.writeRaster(tp.raster, filename)
                    }
                });
            });
        }, 30000);
    }

    public addClient(filename: string, socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) {
        const trackedPicture = this.trackedPictures.get(filename);
        if (!trackedPicture) {
            this.trackedPictures.set(filename, { idToClientMap: new Map(), dirty: false, pendingUpdates: [] });
        }

        this.queue.push(this.ADD_CLIENT_PRIORITY, async () => {
            const trackedPicture = this.trackedPictures.get(filename);
            if (trackedPicture) {
                trackedPicture.idToClientMap.set(socket.id, new BroadcastClient(socket));

                // cold start
                if (!trackedPicture.raster) {
                    trackedPicture.raster = await this.pictureAccessor.getRaster(filename);
                }

                const copiedRaster = trackedPicture.raster.copy()
                socket.emit('join_picture_response', copiedRaster.toJoinPictureResponse());
                trackedPicture.pendingUpdates.forEach(u => socket.emit('server_to_client_update', u));
            }
        });
    }

    public removeClient(
        filename: string,
        socket: Socket<
            ClientToServerEvents,
            ServerToClientEvents,
            InterServerEvents,
            SocketData
        >
    ) {
        const trackedPicture = this.trackedPictures.get(filename);
        if (trackedPicture) {
            trackedPicture.idToClientMap.delete(socket.id);
            if (trackedPicture.idToClientMap.size === 0) {
                this.scheduleWrite(filename, trackedPicture.dirty, trackedPicture.raster),
                this.trackedPictures.delete(filename);
            }
        }
    }

    public broadcastUpdate(pixelUpdate: PixelUpdate, sourceSocketId: string) {
        this.queue.push(this.BROADCAST_UPDATE_PRIORITY, async () => {
            const trackedPicture = this.trackedPictures.get(pixelUpdate.filename);
            if (trackedPicture) {
                trackedPicture.idToClientMap.forEach(
                    (client: Client, socketId: string) => {
                        if (socketId != sourceSocketId) {
                            client.handleUpdate(pixelUpdate);
                        }
                    }
                );
            }
        });

        // TODO need to sort out these priorities, in my water park
        this.queue.push(this.UPDATE_LOCAL_RASTER_PRIORITY, async () => {
            const trackedPicture = this.trackedPictures.get(pixelUpdate.filename);
            if (trackedPicture && trackedPicture.raster) {
                trackedPicture.raster.handlePixelUpdate(pixelUpdate);
                trackedPicture.pendingUpdates.shift();
                // the result of shift should be the same as pixelUpdate
                // the pendingUpdates is to keep track of them for use elsewhere, not here
            }
        });

        const trackedPicture = this.trackedPictures.get(pixelUpdate.filename);
        if (trackedPicture) {
            trackedPicture.pendingUpdates.push(pixelUpdate);
        }
    }

    // WARNING this will bind hte dirty
    private scheduleWrite(filename: string, dirty: boolean, raster?: Raster) {
        this.queue.push(this.WRITE_RASTER_PRIORITY, async () => {
            if (raster && dirty) {
                await this.pictureAccessor.writeRaster(raster, filename)
            }
        });
    }
}
