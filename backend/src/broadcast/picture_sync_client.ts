import Client from './client';
import PictureAccessor from '../picture_accessor/picture_accessor';
import { PixelUpdate } from 'dwf-3-models-tjb';

export default class PictureSyncClient extends Client {
    private readonly filename: string;
    private readonly pictureAccessor: PictureAccessor;

    constructor(filename: string, pictureAccessor: PictureAccessor) {
        super();

        this.filename = filename;
        this.pictureAccessor = pictureAccessor;

        const raster = pictureAccessor.getRaster(filename);

        // in constructor, get contents and save em
        // I also think this is where pingponging takes place

        // so that means we gotta get an async thread going???


    }

    public handleUpdate(pixelUpdate: PixelUpdate): void {
        // then, in Handle update, update copy(s) of buffers
        //
        // which means we gotta implement the logic for updating buffer with an update in a library so we can
        // reuse that ish!
    }
}
