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

    constructor(pictureAccessor: PictureAccessor, raster: Raster) {
        super();

        this.pictureAccessor = pictureAccessor;
        this.raster = raster;
    }

    public handleUpdate(
        pixelUpdate: PixelUpdate,
        sourceSocketId: string
    ): void {
        sourceSocketId;

        console.log('picture_sync_client.handlePixelUpdate');
        this.raster.handlePixelUpdate(pixelUpdate);
    }

    public forcePictureWrite(): void {
        console.log('forcePictureWrite: forcing write');
        this.pictureAccessor.writeRaster(this.raster);
    }
}
