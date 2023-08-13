import Client from './client';
import PictureAccessor from '../picture_accessor/picture_accessor';
import { PixelUpdate } from 'dwf-3-models-tjb';
import { Raster } from 'dwf-3-raster-tjb';
import { Queue } from './queue';
import {BroadcastClient} from './broadcast_client';

// ok, now time to define this thing
//
// when it receives an update, it enqueues a Queue.Job, ie an asynchronous function that is definitely going to run serially and in order.
// This job just updates the raster.
//
// In addition, every so often (writeIntervalMS), it will enqueue a job that writes the entire raster. Since this is in the same queue,
// we know it will run in isolation from the updates to the raster. It also doesn't matter if updates come after because another
// write will be enqueued eventually thanks to the timer nature.
//
// This breaks the Client interface with the synchronizeBroadcastClientInitialization function.
// This function enqueues an Job to start up a broadcast client. This operation requires care.
//
// Lastly, when shutdown (close for now), it enqueues one final write.
export class PictureSyncClient extends Client {
    // all operations involving the raster should be enqueued to ensure isolation and serialization
    private readonly queue: Queue;
    private readonly pictureAccessor: PictureAccessor;
    private raster?: Raster;
    private readonly filename: string;

    private writingInterval?: NodeJS.Timer;
    private readonly writeIntervalMS: number;
    private dirty = false;

    public constructor(
        queue: Queue,
        pictureAccessor: PictureAccessor,
        filename: string,
        writeIntervalMS: number = 30000
    ) {
        super();

        this.queue = queue;
        this.pictureAccessor = pictureAccessor;
        this.filename = filename;
        this.writeIntervalMS = writeIntervalMS;
    }

    public override handleUpdate(pixelUpdate: PixelUpdate): void {
        this.queue.push(() => {
            return new Promise(async (resolve) => {
                if (this.raster) {
                    /* await if async */ this.raster.handlePixelUpdate(pixelUpdate);
                }
                this.dirty = true;
                resolve();
            });
        });
    }

    public override async close(): Promise<void> {
        clearInterval(this.writingInterval);

        this.unqueueWriteRaster();
        await this.queue.waitForCompletion();
    }

    public async initialize(): Promise<void> {
        this.raster = await this.pictureAccessor.getRaster(this.filename);

        this.writingInterval = setInterval(() => {
            if (this.dirty) {
                this.unqueueWriteRaster();
            }
        }, this.writeIntervalMS);
    }

    public synchronizeBroadcastClientInitialization(broadcastClient: BroadcastClient): void {
        this.queue.push(() => {
            return new Promise(async (resolve) => {
                const currentRasterCopy = this.raster!.copy();
                broadcastClient.synchronize(currentRasterCopy);
                resolve();
            });
        });
    }

    private unqueueWriteRaster() {
        if (this.raster) {
            this.queue.push(() => {
                return new Promise(async (resolve) => {
                    await this.pictureAccessor.writeRaster(this.raster!, this.filename);
                    this.dirty = false;
                    resolve();
                });
            });
        }
    }
}
