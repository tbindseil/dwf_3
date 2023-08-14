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
    queue: Queue;

    // these are updates that have been broadcast but haven't been applied to the local copy of the raster
    pendingUpdates: PixelUpdate[];
}

export default class BroadcastMediator {
    private readonly pictureAccessor: PictureAccessor;

    // this maps filename to all clients, where each client has a unique socket id to fetch instantly
    private readonly trackedPictures = new Map<string, TrackedPicture>();

    private readonly HIGH_PRIORITY_WRITE_RASTER = Priority.ONE;
    private readonly ADD_CLIENT_PRIORITY = Priority.TWO;
    private readonly REMOVE_CLIENT_PRIORITY = Priority.THREE;
    private readonly BROADCAST_UPDATE_PRIORITY = Priority.FOUR;
    private readonly UPDATE_LOCAL_RASTER_PRIORITY = Priority.FIVE;
    private readonly WRITE_RASTER_PRIORITY = Priority.SIX;


    constructor(pictureAccessor: PictureAccessor) {
        this.pictureAccessor = pictureAccessor;

        let laps = 0;
        setInterval(() => {
            ++laps;
            this.trackedPictures.forEach((_tp, filename) => {
                // every so often we do a high prio one
                // if we didn't do that, a very active picture
                // could have its write delayed indefinitely
                //
                // an active picture's queue could overflow
                this.scheduleWrite(filename, this.shouldDoHighPriorityWrite(laps) ? this.HIGH_PRIORITY_WRITE_RASTER : this.WRITE_RASTER_PRIORITY);
            });
        }, 30000);
    }

    private shouldDoHighPriorityWrite(laps: number): boolean {
        return laps % 128 === 0;
    }

    public addClient(filename: string, socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) {
        if (!this.trackedPictures.has(filename)) {
            this.trackedPictures.set(filename, { idToClientMap: new Map(), dirty: false, pendingUpdates: [], queue: new Queue() });
        }

        const trackedPicture = this.trackedPictures.get(filename);
        if (trackedPicture) {
            trackedPicture.queue.push(this.ADD_CLIENT_PRIORITY, async () => {
                const trackedPicture_again = this.trackedPictures.get(filename);
                if (trackedPicture_again) {
                    trackedPicture_again.idToClientMap.set(socket.id, new BroadcastClient(socket));

                    // cold start
                    if (!trackedPicture_again.raster) {
                        trackedPicture_again.raster = await this.pictureAccessor.getRaster(filename);
                    }

                    const copiedRaster = trackedPicture_again.raster.copy()
                    socket.emit('join_picture_response', copiedRaster.toJoinPictureResponse());
                    trackedPicture_again.pendingUpdates.forEach(u => socket.emit('server_to_client_update', u));
                }
            });
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
    ) {
        const trackedPicture = this.trackedPictures.get(filename);
        if (trackedPicture) {
            trackedPicture.queue.push(this.REMOVE_CLIENT_PRIORITY, async () => {
                trackedPicture.idToClientMap.delete(socket.id);
            });
        }
    }

    public broadcastUpdate(pixelUpdate: PixelUpdate, sourceSocketId: string) {
        const trackedPicture = this.trackedPictures.get(pixelUpdate.filename);
        if (trackedPicture) {
            trackedPicture.queue.push(this.BROADCAST_UPDATE_PRIORITY, async () => {
                const trackedPicture_again = this.trackedPictures.get(pixelUpdate.filename);
                if (trackedPicture_again) {
                    trackedPicture_again.idToClientMap.forEach(
                        (client: Client, socketId: string) => {
                            if (socketId != sourceSocketId) {
                                client.handleUpdate(pixelUpdate);
                            }
                        }
                    );
                }
            });

            trackedPicture.queue.push(this.UPDATE_LOCAL_RASTER_PRIORITY, async () => {
                const trackedPicture_again = this.trackedPictures.get(pixelUpdate.filename);
                if (trackedPicture_again && trackedPicture_again.raster) {
                    trackedPicture_again.raster.handlePixelUpdate(pixelUpdate);
                    trackedPicture_again.pendingUpdates.shift();
                    // the result of shift should be the same as pixelUpdate
                    // the pendingUpdates is to keep track of them for use elsewhere, not here
                }
            });

            trackedPicture.pendingUpdates.push(pixelUpdate);
        }
    }

    private scheduleWrite(filename: string, priority: Priority) {
        // it could be dirty by the time we get to it,
        // so check then
        const trackedPicture = this.trackedPictures.get(filename);
        if (trackedPicture) {
            trackedPicture.queue.push(priority, async () => {
                const trackedPicture_again = this.trackedPictures.get(filename);
                if (trackedPicture_again && trackedPicture_again.raster && trackedPicture_again.dirty) {
                    await this.pictureAccessor.writeRaster(trackedPicture_again.raster, filename)


                    // if we write and there are no clients, can we delete, yes
                    // no clients means noone can send updates
                    // write means there were no more local picture update events
                    if (trackedPicture.idToClientMap.size === 0) {
                        this.trackedPictures.delete(filename);
                    }
                }
            });
        }
    }
}
