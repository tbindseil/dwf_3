import PictureAccessor from './picture_accessor';
import generatePictureFilename from './filename_generator';
import JimpAdapter from './jimp_adapter';
import * as fs from 'fs';
import path from 'path';
import { PictureResponse } from 'dwf-3-models-tjb';
import { Raster } from 'dwf-3-raster-tjb';

export default class LocalPictureAccessor extends PictureAccessor {
    private readonly jimpAdapter: JimpAdapter;
    private readonly prototypeFileName: string;
    private readonly baseDirectory: string;

    private readonly testDirectory = '/Users/tj/Projects/dwf_3/pictures/test'; // TODO remove this

    constructor(jimpAdapter: JimpAdapter, prototypeFileName: string, baseDirectory: string) {
        super();

        this.jimpAdapter = jimpAdapter;
        this.prototypeFileName = prototypeFileName;
        this.baseDirectory = baseDirectory;
    }

    public async createNewPicture(pictureName: string, createdBy: string): Promise<string> {
        const filename = generatePictureFilename(pictureName, createdBy);
        try {
            await fs.promises.copyFile(this.prototypeFileName, path.join(this.baseDirectory, filename), fs.constants.COPYFILE_EXCL);
        } catch (error: any) {
            console.log(`issue creating new picture: ${JSON.stringify(error)}`);
            throw error;
        }
        return filename;
    }


    public createNewPicture_with_dimensions(width_supplied: number): string {
        const phi = (1 + Math.sqrt(5)) / 2; // roughly 1.618033988749894
        const width = 1000;
        const height = Math.ceil(width * phi);

        const asArray = new Uint8ClampedArray(4 * width * height);
        for (let i = 0; i < asArray.length; ++i) {
            if (i % 4 === 3) {
                asArray[i] = 0xff;
            }
        }

        const buffer = Buffer.from(asArray);

        // Jimp.write(buffer);
        // const jimg = new Jimp(width, height);
        const jimg = this.jimpAdapter.createJimp(width, height);

        jimg.bitmap.data = buffer;
        const filename = `sample_${width}_${height}.png`;
        const testDirectory = '/Users/tj/Projects/dwf_3/pictures/test';
        jimg.write(path.join(testDirectory, filename));

        return filename;
    }


    public async getPicture(filename: string): Promise<Buffer> {
        try {
            return await fs.promises.readFile(path.join(this.baseDirectory, filename));
        } catch (error: any) {
            console.log(`issue reading picture contents, ${JSON.stringify(error)}`);
            throw error;
        }
    }

    public async getRaster(filename: string): Promise<PictureResponse> {
        const contents = await this.jimpAdapter.read(path.join(this.baseDirectory, filename));
        return {
            width: contents.bitmap.width,
            height: contents.bitmap.height,
            data: contents.bitmap.data
        };
    }

    public async writeRaster(raster: Raster): Promise<void> {
        const jimg = this.jimpAdapter.createJimp(raster.width, raster.height);

        jimg.bitmap.data = Buffer.from(raster.getBuffer());

        // TODO why isn't this blocking?
        jimg.write(path.join(this.testDirectory, 'writter_from_raster.png'));
    }

    public getFileSystem(): string {
        return 'LOCAL';
    }
}
