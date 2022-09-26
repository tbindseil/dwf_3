import Client from './client';
import PictureAccessor from '../picture_accessor/picture_accessor';
import { PixelUpdate } from 'dwf-3-models-tjb';
import { Raster } from 'dwf-3-raster-tjb';

export default class PictureSyncClient extends Client {
    private readonly pictureAccessor: PictureAccessor;
    private readonly raster: Raster;

    constructor(filename: string, pictureAccessor: PictureAccessor, raster: Raster) {
        super();

        this.pictureAccessor = pictureAccessor;
        this.raster = raster;
    }

    public handleUpdate(pixelUpdate: PixelUpdate, sourceSocketId: string): void {
        // raster.
        // then, in Handle update, update copy(s) of buffers
        //
        // which means we gotta implement the logic for updating buffer with an update in a library so we can
        // reuse that ish!
    }
}
