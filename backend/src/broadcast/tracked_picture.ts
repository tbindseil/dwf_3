import { Priority, Queue } from './queue';
import { Raster } from 'dwf-3-raster-tjb';
import { PixelUpdate } from 'dwf-3-models-tjb';
import PictureAccessor from '../picture_accessor/picture_accessor';
import { BroadcastClient } from './broadcast_client';

export class TrackedPicture {
    private readonly idToClientMap: Map<string, BroadcastClient> = new Map();
    private readonly workQueue: Queue;
    private readonly pictureAccessor: PictureAccessor;
    private readonly filename: string;
    private dirty: boolean = false;
    private writeEnqueued = false;
    private raster?: Raster;

    // these are updates that have been broadcast but haven't been applied to the local copy of the raster
    pendingUpdates: PixelUpdate[] = [];
    public constructor(
        queue: Queue,
        pictureAccessor: PictureAccessor,
        filename: string
    ) {
        this.workQueue = queue;
        this.pictureAccessor = pictureAccessor;
        this.filename = filename;
    }

    public enqueueWrite(priority: Priority, force = false) {
        // if force is true
        // then not true is false and we continue
        // if write enqueued is true
        // not write enqueued is false and we have to evaluate force
        // if write enqueued is false
        // not write enqueued is true
        // and we bypass
        if (!(force || !this.writeEnqueued)) {
            return;
        }

        this.workQueue.push(priority, async () => {
            if (this.raster && this.dirty) {
                await this.pictureAccessor.writeRaster(
                    this.raster,
                    this.filename
                );

                this.dirty = false;
                this.writeEnqueued = false;

                // if we write and there are no clients, release the raster
                // no clients means noone can send updates
                // write priority (determined by BroadcastMediator) means
                // there were no more local picture update events
                if (this.idToClientMap.size === 0) {
                    this.raster = undefined;
                }
            }
        });

        this.writeEnqueued = true;
    }

    public enqueueAddClient(
        priority: Priority,
        socketId: string,
        broadcastClient: BroadcastClient
    ) {
        this.workQueue.push(priority, async () => {
            this.idToClientMap.set(socketId, broadcastClient);

            // cold start
            if (!this.raster) {
                this.raster = await this.pictureAccessor.getRaster(
                    this.filename
                );
            }

            const copiedRaster = this.raster.copy();
            broadcastClient.initializeRaster(copiedRaster);
            this.pendingUpdates.forEach((u) => broadcastClient.handleUpdate(u));
        });
    }

    public enqueueRemoveClient(priority: Priority, socketId: string) {
        this.workQueue.push(priority, async () => {
            this.idToClientMap.delete(socketId);
        });
    }

    public enqueueBroadcastUpdate(
        priority: Priority,
        pixelUpdate: PixelUpdate,
        sourceSocketId: string
    ) {
        this.workQueue.push(priority, async () => {
            this.idToClientMap.forEach(
                (client: BroadcastClient, socketId: string) => {
                    client.handleUpdate(pixelUpdate);
                }
            );

            this.pendingUpdates.push(pixelUpdate);
        });
    }

    public enqueueUpdateLocalRaster(
        priority: Priority,
        pixelUpdate: PixelUpdate
    ) {
        this.workQueue.push(priority, async () => {
            if (this.raster) {
                this.raster.handlePixelUpdate(pixelUpdate);
                this.pendingUpdates.shift();
                this.dirty = true;
                // the result of shift should be the same as pixelUpdate
                // the pendingUpdates is to keep track of them for use elsewhere, not here
            }
        });
    }

    public stopped(): boolean {
        return !this.raster && this.idToClientMap.size == 0;
    }
}
