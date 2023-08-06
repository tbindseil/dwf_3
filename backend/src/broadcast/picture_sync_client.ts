import Client from './client';
import PictureAccessor from '../picture_accessor/picture_accessor';
import { PixelUpdate } from 'dwf-3-models-tjb';
import { Raster } from 'dwf-3-raster-tjb';
import { Queue } from './queue';

// TJTAG tests for new stuff and see if it works in the web

export class PictureSyncClient extends Client {
    private readonly pictureAccessor: PictureAccessor;
    private readonly raster: Raster;
    private dirty: boolean;
    private readonly writingInterval: NodeJS.Timer;
    private readonly queue: Queue;

    public constructor(
        queue: Queue,
        pictureAccessor: PictureAccessor,
        raster: Raster,
        writeInterval: number = 300
    ) {
        super();

        this.queue = queue;
        this.pictureAccessor = pictureAccessor;
        // no thread protection needed because its only ever being read
        this.raster = raster;
        this.dirty = false;

        this.writingInterval = setInterval(() => {
            console.log('TJTAG writing interval');
            if (this.dirty) {
                this.pictureAccessor.writeRaster(this.raster);
                this.dirty = false;
            }
        }, writeInterval);
    }

    public handleUpdate(pixelUpdate: PixelUpdate): void {
        this.queue.push(() => {
            return new Promise((resolve, reject) => {
                reject;

                this.raster.handlePixelUpdate(pixelUpdate);
                this.dirty = true;
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
