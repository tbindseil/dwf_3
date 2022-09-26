import { PictureResponse } from 'dwf-3-models-tjb';
import { Raster } from 'dwf-3-raster-tjb';

export default class PictureAccessor {
    public async createNewPicture(pictureName: string, createdBy: string): Promise<string> {
        pictureName;
        createdBy;
        throw new Error('PictureAccessor.createNewPicture not implemented');
    }

    public getFileSystem(): string {
        throw new Error('PictureAccessor.createNewPicture not implemented');
    }

    public async getPicture(filename: string): Promise<Buffer> {
        filename;
        throw new Error('PictureAccessor.getPicture not implemented');
    }

    public async getRaster(filename: string): Promise<PictureResponse> {
        filename;
        throw new Error('PictureAccessor.getRaster not implemented');
    }

    public async writeRaster(raster: Raster): Promise<void> {
        raster;
        throw new Error('PictureAccessor.getRaster not implemented');
    }
}
