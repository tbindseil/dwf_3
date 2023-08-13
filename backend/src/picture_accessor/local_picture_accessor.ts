import PictureAccessor from './picture_accessor';
import generatePictureFilename from './filename_generator';
import JimpAdapter from './jimp_adapter';
import * as fs from 'fs';
import path from 'path';
import { Raster } from 'dwf-3-raster-tjb';

export default class LocalPictureAccessor extends PictureAccessor {
    private readonly jimpAdapter: JimpAdapter;
    private readonly baseDirectory: string;

    constructor(jimpAdapter: JimpAdapter, baseDirectory: string) {
        super();

        this.jimpAdapter = jimpAdapter;
        this.baseDirectory = baseDirectory;
    }

    public async createNewPicture(
        pictureName: string,
        createdBy: string,
        width: number,
        height: number
    ): Promise<string> {
        const filename = generatePictureFilename(pictureName, createdBy);
        try {
            const jimg = this.jimpAdapter.createJimp(width, height);
            const arrayBuffer = new ArrayBuffer(width * height * 4);
            jimg.bitmap.data = Buffer.from(new Uint8ClampedArray(arrayBuffer));

            // set alpha to max for opagueness
            for (let i = 3; i < width * height * 4; i += 4) {
                jimg.bitmap.data[i] = 255;
            }
            await jimg.writeAsync(path.join(this.baseDirectory, filename));
        } catch (error: unknown) {
            console.log(`issue creating new picture: ${JSON.stringify(error)}`);
            throw error;
        }
        return filename;
    }

    // TODO rename to readRaster
    public async getRaster(filename: string): Promise<Raster> {
        const fullPath = path.join(this.baseDirectory, filename);

        // throws when fullPath doesn't exist, but jimp doesn't for some reason
        await fs.promises.stat(fullPath);

        const contents = await this.jimpAdapter.read(fullPath);
        return new Raster(
            contents.bitmap.width,
            contents.bitmap.height,
            contents.bitmap.data,
        );
    }

    public async writeRaster(raster: Raster, filename: string): Promise<void> {
        const jimg = this.jimpAdapter.createJimp(raster.width, raster.height);

        // creates a new buffer
        jimg.bitmap.data = Buffer.from(raster.getBuffer());

        await jimg.writeAsync(path.join(this.baseDirectory, filename));
    }

    public getFileSystem(): string {
        return 'LOCAL';
    }
}
