import { Priority, Queue } from './queue';
import { Raster } from 'dwf-3-raster-tjb';
import { Update } from 'dwf-3-models-tjb';
import PictureAccessor from '../picture_accessor/picture_accessor';
import { BroadcastClient } from './broadcast_client';

// for injecting mocks into unit tests
export const makeTrackedPicture = (
    queue: Queue,
    pictureAccessor: PictureAccessor,
    filename: string
) => new TrackedPicture(queue, pictureAccessor, filename);

export class TrackedPicture {
    private readonly idToClientMap: Map<string, BroadcastClient> = new Map();
    private readonly workQueue: Queue;
    private readonly pictureAccessor: PictureAccessor;
    private readonly filename: string;
    private dirty: boolean = false;
    private writeEnqueued = false;
    private raster?: Raster;

    // these are updates that have been broadcast but haven't been applied to the local copy of the raster
    pendingUpdates: Update[] = [];
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
        if (force || !this.writeEnqueued) {
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
                this.raster = await this.pictureAccessor.readRaster(
                    this.filename
                );
            }

            const copiedRaster = this.raster.copy();
            broadcastClient.initializeRaster(copiedRaster);

            // this one is just getting added, hence the arbitrary non matching socketid
            this.pendingUpdates.forEach((u) => {
                broadcastClient.handleUpdate(u);
            });
        });
    }

    public enqueueRemoveClient(priority: Priority, socketId: string) {
        this.workQueue.push(priority, async () => {
            const broadcastClient = this.idToClientMap.get(socketId);
            if (broadcastClient) {
                broadcastClient.close();
            }
            this.idToClientMap.delete(socketId);
        });
    }

    public enqueueBroadcastUpdate(priority: Priority, update: Update) {
        console.log('@@@@ TJTAG @@@@ broadcast debug 3');
        this.workQueue.push(priority, async () => {
            console.log('@@@@ TJTAG @@@@ broadcast debug 4');
            this.idToClientMap.forEach((client: BroadcastClient) => {
                client.handleUpdate(update);
            });

            this.pendingUpdates.push(update);
        });
    }

    public enqueueUpdateLocalRaster(priority: Priority) {
        this.workQueue.push(priority, async () => {
            if (this.raster) {
                const nextUpdate = this.pendingUpdates.shift();
                if (!nextUpdate) {
                    console.error(
                        'nextUpdate is undefined, something went horribly wrong'
                    );
                    throw Error('stack trace');
                }
                Update.updateRaster(this.raster, nextUpdate);
                this.dirty = true;
            }
        });
    }

    public stopped(): boolean {
        return !this.raster && this.idToClientMap.size == 0;
    }
}
