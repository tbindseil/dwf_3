// wow...
// what if I made a lambda picture sync client

import Client from './client';
import PictureAccessor from '../picture_accessor/picture_accessor';
import { PixelUpdate } from 'dwf-3-models-tjb';
import { Raster } from 'dwf-3-raster-tjb';
import Queue from 'queue';

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

        this.queue = new Queue({
            concurrency: 1,
            autostart: true,
        });

        this.pictureAccessor = pictureAccessor;
        // TODO this needs a reader writer lock
        this.raster = raster;
        this.dirty = false;

        this.writingInterval = setInterval(() => {
            if (this.dirty) {
                pictureAccessor.writeRaster(this.raster);

                // no need to worry about edge case where an update (specifically the last one) comes between write and
                // dirty being cleared. the picture sync client writes when all things are done in the queue
                this.dirty = false;
            }
        }, 30000);
    }

    public handleUpdate(
        pixelUpdate: PixelUpdate,
        sourceSocketId: string
    ): void {
        sourceSocketId;

        // TODO each update needs to take in the raster and do the update itself
        this.queue.push(() => {
            return new Promise((resolve, reject) => {
                reject;
                this.raster.handlePixelUpdate(pixelUpdate);
                const result = 'success';
                resolve(result);
            });
        });
    }

    public close(): void {
        clearInterval(this.writingInterval);

        // now once we run out, add the handler to do the final write
        this.queue.addEventListener('success', (e) => {
            this.pictureAccessor.writeRaster(this.raster);
        });

        // and write just in case
        this.pictureAccessor.writeRaster(this.raster);
    }
}
