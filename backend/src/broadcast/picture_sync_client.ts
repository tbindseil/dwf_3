import Client from './client';
import PictureAccessor from '../picture_accessor/picture_accessor';
import { PixelUpdate } from 'dwf-3-models-tjb';
import { Raster } from 'dwf-3-raster-tjb';

// TJTAG tests for new stuff and see if it works in the web

type Job = () => Promise<void>;
class Queue {
    private jobs: Job[];

    public constructor() {
        this.jobs = [];
    }
    public push(job: Job): void {
        this.jobs.push(job);
    }
    public async waitForCompletion(): Promise<void> {
        while (this.jobs.length > 0) {
            console.log('waitForCompletion');
        }
    }
}

export default class PictureSyncClientFactory {
    public createPictureSyncClient(
        pictureAccessor: PictureAccessor,
        raster: Raster
    ): PictureSyncClient {
        return new PictureSyncClient(pictureAccessor, raster);
    }
}

export class PictureSyncClient extends Client {
    private readonly pictureAccessor: PictureAccessor;
    private readonly raster: Raster;
    private dirty: boolean;
    private readonly writingInterval: NodeJS.Timer;
    private readonly queue: Queue;

    constructor(pictureAccessor: PictureAccessor, raster: Raster) {
        super();

        this.queue = new Queue();
        this.pictureAccessor = pictureAccessor;
        // no thread protection needed because its only ever being read
        this.raster = raster;
        this.dirty = false;

        this.writingInterval = setInterval(() => {
            if (this.dirty) {
                pictureAccessor.writeRaster(this.raster);
                this.dirty = false;
            }
        }, 30000);
    }

    public handleUpdate(
        pixelUpdate: PixelUpdate,
        sourceSocketId: string
    ): void {
        sourceSocketId;

        this.queue.push(() => {
            return new Promise((resolve, reject) => {
                reject;

                this.raster.handlePixelUpdate(pixelUpdate);
                resolve();
            });
        });
    }

    public async close(): Promise<void> {
        clearInterval(this.writingInterval);

        // now once we run out, add the handler to do the final write
        await this.queue.waitForCompletion();

        // and write just in case
        this.pictureAccessor.writeRaster(this.raster);
    }
}
