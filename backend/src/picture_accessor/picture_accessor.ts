import { JoinPictureResponse } from 'dwf-3-models-tjb';
import { Raster } from 'dwf-3-raster-tjb';

export default abstract class PictureAccessor {
    public abstract createNewPicture(
        pictureName: string,
        createdBy: string
    ): Promise<string>;

    public abstract getFileSystem(): string;

    public abstract getRaster(filename: string): Promise<JoinPictureResponse>;

    public abstract writeRaster(
        raster: Raster,
        filename: string
    ): Promise<void>;

    public abstract createNewPicture_with_dimensions(
        width_supplied: number
    ): string;
}
