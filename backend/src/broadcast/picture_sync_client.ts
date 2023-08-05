import Client from './client';
import PictureAccessor from '../picture_accessor/picture_accessor';
import { PixelUpdate } from 'dwf-3-models-tjb';
import { Raster } from 'dwf-3-raster-tjb';

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

    constructor(pictureAccessor: PictureAccessor, raster: Raster) {
        super();

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

    // TODO do i know that subsequent calls here will alays go in order? no! I think they won't
    // ... i think i need somehting like queue https://www.npmjs.com/package/queue
    public handleUpdate(
        pixelUpdate: PixelUpdate,
        sourceSocketId: string
    ): void {
        sourceSocketId;

        // TODO each update needs to take in the raster and do the update itself
        this.raster.handlePixelUpdate(pixelUpdate);
    }

    public close(): void {
        clearInterval(this.writingInterval);
        this.pictureAccessor.writeRaster(this.raster);
    }
}
