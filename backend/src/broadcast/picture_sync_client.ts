import Client from './client';
import PictureAccessor from '../picture_accessor/picture_accessor';
import { PixelUpdate } from 'dwf-3-models-tjb';
import { Raster } from 'dwf-3-raster-tjb';
import { Queue } from './queue';

export class PictureSyncClient extends Client {
    private readonly queue: Queue;
    private readonly pictureAccessor: PictureAccessor;
    private currentRaster?: Raster;
    private lastWrittenRaster?: Raster;
    private readonly filename: string;

    private writingInterval?: NodeJS.Timer;
    private dirty: boolean;
    private unwrittenUpdates: PixelUpdate[];

    public constructor(
        queue: Queue,
        pictureAccessor: PictureAccessor,
        filename: string,
    ) {
        super();

        this.queue = queue;
        this.pictureAccessor = pictureAccessor;

        this.filename = filename;
        this.dirty = false;
        this.unwrittenUpdates = [];
    }

    public override handleUpdate(pixelUpdate: PixelUpdate): void {
        this.queue.push(() => {
            return new Promise((resolve) => {
                // TODO what order should this be?
                this.unwrittenUpdates.push(pixelUpdate);

                if (this.currentRaster) {
                    /* await if async */ this.currentRaster.handlePixelUpdate(pixelUpdate);
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

    public async initialize(writeInterval: number = 30000): Promise<void> {
        this.currentRaster = await this.pictureAccessor.getRaster(this.filename);
        this.lastWrittenRaster = this.currentRaster.copy();

        this.writingInterval = setInterval(async () => {
            if (this.dirty) {
                this.unqueueWriteRaster();
            }
        }, writeInterval);
    }

    // the last written raster is only copied to synchronously,
    // so we don't have to worry about it changing while we are copying it
    public getLastWrittenRasterCopy(): [Raster, PixelUpdate[]] {
        if (!this.lastWrittenRaster) {
            throw Error('getLastWrittenRaster called before raster initialized');
        }
        return [this.lastWrittenRaster.copy(), this.unwrittenUpdates];
    }

    // the reason this enqueues its work is to ensure that it happens serially with any
    // of the writing that is done with the handling of updates
    private unqueueWriteRaster() {
        if (this.currentRaster) {
            this.queue.push(() => {
                return new Promise(async (resolve) => {
                    await this.pictureAccessor.writeRaster(this.currentRaster!, this.filename);

                    // all the below (notably the replacement of lastWrittenRaster and the clearing
                    // of unwrittenUpdates) all happen synchronously
                    this.lastWrittenRaster = this.currentRaster!.copy();
                    this.dirty = false;
                    this.unwrittenUpdates = [];
                    resolve();
                });
            });
        }
    }
}

        // whoa, if getLastWrittenRaster becomes no longer async, I think things get a lot simpler
        // and I think that happens when we keep two rasters and can copy to ret value without relinquishing control
        // and at that point, we don't even need to copy
        // TODO htat's a mindblower
        // honestly more of a consideration for simplification after thigns are more stable
//
// after making hte planned changes, it is no longer async, but I didn't do any of the consequential code changes yet
//
//
//
//
//  it seemse that the above was consequential, enough to remove the cic altogether!
//  now, the last thing that remains to both be solved and be considered is what to do about the await
//  in the write raster
//  1. does it work as described?
//  2. could a lock eliminate the need for a second raster?
//  2a. here we mean a simple mutex lock in order to ensure only one func can do its thing
//  3. on the other hand (of hte lock idea) is utilize the enqueue methodology
//  4. maybe we could enqueue an event that synchronizes the broadcast client
