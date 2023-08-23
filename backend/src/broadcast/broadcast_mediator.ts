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
import { TrackedPicture } from './tracked_picture';
import { BroadcastClient } from './broadcast_client';

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
            this.trackedPictures.forEach((trackedPicture, filename) => {
                // every so often we do a high prio one
                // if we didn't do that, a very active picture
                // could have its write delayed indefinitely

                if (trackedPicture.stopped()) {
                    this.trackedPictures.delete(filename);
                } else {
                    const highPriorityWrite =
                        this.shouldDoHighPriorityWrite(laps);
                    trackedPicture.enqueueWrite(
                        highPriorityWrite
                            ? this.HIGH_PRIORITY_WRITE_RASTER
                            : this.WRITE_RASTER_PRIORITY,
                        highPriorityWrite
                    );
                }
            });
        }, 30000);
    }

    private shouldDoHighPriorityWrite(laps: number): boolean {
        return laps % 128 === 0;
    }

    public addClient(
        filename: string,
        socket: Socket<
            ClientToServerEvents,
            ServerToClientEvents,
            InterServerEvents,
            SocketData
        >
    ) {
        if (!this.trackedPictures.has(filename)) {
            this.trackedPictures.set(
                filename,
                new TrackedPicture(new Queue(), this.pictureAccessor, filename)
            );
        }

        const trackedPicture = this.trackedPictures.get(filename);
        if (trackedPicture) {
            const broadcastClient = new BroadcastClient(socket);
            trackedPicture.enqueueAddClient(
                this.ADD_CLIENT_PRIORITY,
                socket.id,
                broadcastClient
            );
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
            trackedPicture.enqueueRemoveClient(
                this.REMOVE_CLIENT_PRIORITY,
                socket.id
            );
        }
    }

    public broadcastUpdate(pixelUpdate: PixelUpdate, sourceSocketId: string) {
        const trackedPicture = this.trackedPictures.get(pixelUpdate.filename);
        if (trackedPicture) {
            trackedPicture.enqueueBroadcastUpdate(
                this.BROADCAST_UPDATE_PRIORITY,
                pixelUpdate,
                sourceSocketId
            );
            trackedPicture.enqueueUpdateLocalRaster(
                this.UPDATE_LOCAL_RASTER_PRIORITY
            );
        }
    }
}
