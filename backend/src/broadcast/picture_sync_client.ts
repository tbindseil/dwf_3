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
    private interval: NodeJS.Timer | undefined;

    constructor(pictureAccessor: PictureAccessor, raster: Raster) {
        super();

        this.pictureAccessor = pictureAccessor;
        this.raster = raster;
        this.dirty = false;
        this.interval = undefined;
    }

    public handleUpdate(
        pixelUpdate: PixelUpdate,
        sourceSocketId: string
    ): void {
        sourceSocketId;

        const wasDirty = this.dirty;
        this.raster.handlePixelUpdate(pixelUpdate);
        this.dirty = true;

        // weird, if nodejs will never give up control outside of await or async calls,
        // then couldn't one thread never give it up?

        // if (!wasDirty)?

        if (!this.interval) {
            // rather than writing immediately, we kick off a timer
            // but, that means each write kicks off the timer so its still not right
            this.interval = setInterval(() => {
                this.forcePictureWrite();

                if (this.dirty) {
                    this.dirty = false;
                } else {
                    this.interval = undefined;
                    clearInterval(this.interval);
                    // so im worried about a handle update happenin ghwere i haven't yet cleared
                    // the timer variable, so no new timer is created but
                }
            }, 1000);
        }
    }

    // put this on a timer
    private forcePictureWrite(): void {
        this.pictureAccessor.writeRaster(this.raster);
    }
}
