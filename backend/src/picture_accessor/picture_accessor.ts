import { JoinPictureResponse } from 'dwf-3-models-tjb';
import { Raster } from 'dwf-3-raster-tjb';

export default abstract class PictureAccessor {
    public abstract createNewPicture(
        pictureName: string,
        createdBy: string,
        width: number,
        height: number
    ): Promise<string>;

    public abstract getFileSystem(): string;

    public abstract getRaster(filename: string): Promise<JoinPictureResponse>;

    public abstract writeRaster(
        raster: Raster,
        filename: string
    ): Promise<void>;
}
