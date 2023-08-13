import Client from './client';
import PictureAccessor from '../picture_accessor/picture_accessor';
import { PixelUpdate } from 'dwf-3-models-tjb';
import { Raster } from 'dwf-3-raster-tjb';
import { Queue } from './queue';
import {BroadcastClient} from './broadcast_client';

export class PictureSyncClient extends Client {
    private readonly queue: Queue;
    private readonly pictureAccessor: PictureAccessor;
    private currentRaster?: Raster;
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

    public async initialize(): Promise<void> {
        this.currentRaster = await this.pictureAccessor.getRaster(this.filename);

        this.writingInterval = setInterval(() => {
            if (this.dirty) {
                this.unqueueWriteRaster();
            }
        }, this.writeIntervalMS);
    }

    public synchronizeBroadcastClientInitialization(broadcastClient: BroadcastClient): void {
        // enqueueing this ensures that the raster won't be touched while we are copying it
        this.queue.push(() => {
            return new Promise(async (resolve) => {
                const currentRasterCopy = this.currentRaster!.copy();

                // TODO could this be brought up to client interface as initialize
                // but the arguments of initialize for this and broadcastClient are pretty different
                //
                // in order to get around this, all broadcast clients could be constructed with a reference
                // to the picture sync client
                // then, we could call initialize on them when they are created with no arg
                // and we can move the timeout are in psc's initialize to the constructor

                broadcastClient.synchronize(currentRasterCopy);
                resolve();

                // this is all good and dandy except we still don't account for updates that are enqueued as jobs
                // those would've been ignored by broadcast client and aren't on the raster yet when it is copied
                //
                // one solution could be to have 3 states in bc. This way, it can
                // 1. ignore updates until initialized (the updates will happen to the raster in psc)
                // 2. once the syncrhonization is requested (via this action), broadcast client can start to hold on to updates
                // 3. upon bc.synchronize, all held updates are sent after the raster, these updates should be the same as what is currently enqueued in this psc queue

                // and then I think I said somehwere else that we could not add the broadcast client to the map until after
                // picture sync client is initialized, then we only need two states
                // 1. initial raster not sent
                // 2. initial raster sent
            });
        });
    }

    // the reason this enqueues its work is to ensure that it happens serially with any
    // of the writing that is done with the handling of updates
    private unqueueWriteRaster() {
        if (this.currentRaster) {
            this.queue.push(() => {
                return new Promise(async (resolve) => {
                    await this.pictureAccessor.writeRaster(this.currentRaster!, this.filename);
                    this.dirty = false;
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
