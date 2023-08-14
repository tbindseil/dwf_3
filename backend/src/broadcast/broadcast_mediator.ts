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
import {TrackedPicture} from './tracked_picture';

export default class BroadcastMediator {
    private readonly pictureAccessor: PictureAccessor;
    private readonly _writeInterval: NodeJS.Timer;

    // this maps filename to all clients, where each client has a unique socket id to fetch instantly
    private readonly trackedPictures = new Map<string, TrackedPicture>();

    private readonly HIGH_PRIORITY_WRITE_RASTER = Priority.ONE;
    private readonly ADD_CLIENT_PRIORITY = Priority.TWO;
    private readonly BROADCAST_UPDATE_PRIORITY = Priority.THREE;
    private readonly UPDATE_LOCAL_RASTER_PRIORITY = Priority.FOUR;
    private readonly WRITE_RASTER_PRIORITY = Priority.FIVE;


    constructor(pictureAccessor: PictureAccessor) {
        this.pictureAccessor = pictureAccessor;

        let laps = 0;
        this._writeInterval = setInterval(() => {
            ++laps;
            this.trackedPictures.forEach((_tp, filename) => {
                // every 128 we do a high prio one
                // if we didn't do that, a very active picture
                // could have its write delayed indefinitely
                this.scheduleWrite(filename, this.shouldDoHighPriorityWrite(laps) ? this.HIGH_PRIORITY_WRITE_RASTER : this.WRITE_RASTER_PRIORITY);
            });
        }, 30000);
    }

    private shouldDoHighPriorityWrite(laps: number): boolean {
        return laps % 128 === 0;
    }

    public addClient(filename: string, socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) {
        const trackedPicture = this.trackedPictures.get(filename);
        if (!trackedPicture) {
            this.trackedPictures.set(filename, new TrackedPicture(new Queue()));
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
                this.scheduleWrite(filename, this.WRITE_RASTER_PRIORITY);
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
    private scheduleWrite(filename: string, priority: Priority) {
        // it could be dirty by the time we get to it,
        // so check then
        this.queue.push(priority, async () => {
            const trackedPicture = this.trackedPictures.get(filename);
            if (trackedPicture && trackedPicture.raster && trackedPicture.dirty) {
                await this.pictureAccessor.writeRaster(trackedPicture.raster, filename)
            }
        });
    }
}
