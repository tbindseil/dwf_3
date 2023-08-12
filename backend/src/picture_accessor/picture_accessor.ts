import { Raster } from 'dwf-3-raster-tjb';

export default abstract class PictureAccessor {
    public abstract createNewPicture(
        pictureName: string,
        createdBy: string,
        width: number,
        height: number
    ): Promise<string>;

    public abstract getFileSystem(): string;

    public abstract getRaster(filename: string): Promise<Raster>;

    public abstract writeRaster(
        raster: Raster,
        filename: string
    ): Promise<void>;
}
