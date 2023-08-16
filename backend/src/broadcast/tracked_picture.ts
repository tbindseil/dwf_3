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

    public enqueueWriteOperation(priority: Priority) {
        this.workQueue.push(priority, async () => {
            if (this.raster && this.dirty) {
                await this.pictureAccessor.writeRaster(
                    this.raster,
                    this.filename
                );
                this.dirty = false;

                // if we write and there are no clients, can we delete, yes
                // no clients means noone can send updates
                // write means there were no more local picture update events
                //                if (trackedPicture.idToClientMap.size === 0) {
                //                    // this will cause problems with putting these operations
                //                    // in a trackedpicture object
                //                    this.trackedPictures.delete(filename);
                //                TODO this needs to move
                //                }
            }
        });
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
            // maybe move this into broadcast_client
            // and pass that in? that way it can be added to the map
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
                    if (socketId != sourceSocketId) {
                        client.handleUpdate(pixelUpdate);
                    }
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
}

// 1.
// starts a timer on start
// the timer writes the raster once in a hwhile
// and even less frequency writes at a higher priority
//
// 2.
// addsclients by
// setting up the tp when first client
// enqueueing a start client function
//
// 3.
// removes client by
// enqueuing a remove client operation
//
// 4.
// broadcasts by
// enqueueing a broadcast operation
// enqueueing a local raster update operation
//
// it looks kinda whack to do this as standalone operation functions
// but having them as members on the tracked picture might be good
//
