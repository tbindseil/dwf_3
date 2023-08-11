import PictureAccessor from './picture_accessor';
import generatePictureFilename from './filename_generator';
import JimpAdapter from './jimp_adapter';
import * as fs from 'fs';
import path from 'path';
import { JoinPictureResponse } from 'dwf-3-models-tjb';
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

    public createNewPicture_with_dimensions(width_supplied: number): string {
        //         const phi = (1 + Math.sqrt(5)) / 2; // roughly 1.618033988749894
        //         const width = 1000;
        //         const height = Math.ceil(width * phi);
        //
        //         const asArray = new Uint8ClampedArray(4 * width * height);
        //         for (let i = 0; i < asArray.length; ++i) {
        //             if (i % 4 === 3) {
        //                 asArray[i] = 0xff;
        //             }
        //         }
        //
        //         const buffer = Buffer.from(asArray);
        //
        //         // Jimp.write(buffer);
        //         // const jimg = new Jimp(width, height);
        //         const jimg = this.jimpAdapter.createJimp(width, height);
        //
        //         jimg.bitmap.data = buffer;
        //         const filename = `sample_${width}_${height}.png`;
        //         jimg.write(path.join(LocalPictureAccessor.testDirectory, filename));
        //
        //         return filename;
        width_supplied;
        return 'TODO';
    }

    public async getRaster(filename: string): Promise<JoinPictureResponse> {
        const fullPath = path.join(this.baseDirectory, filename);

        // throws when fullPath doesn't exist, but jimp doesn't for some reason
        await fs.promises.stat(fullPath);

        const contents = await this.jimpAdapter.read(fullPath);
        console.log(`TJTAG width is; ${contents.bitmap.width}`);
        console.log(`TJTAG height is; ${contents.bitmap.height}`);
        console.log(`TJTAG datalength is; ${contents.bitmap.data.length}`);
        for (let i = 0; i < 64; ++i) {
            console.log(`TJTAG - data[${i}] is: ${contents.bitmap.data[i]}`);
            // TJTAG whoa data might be four times as long
        }
        return {
            width: contents.bitmap.width,
            height: contents.bitmap.height,
            data: contents.bitmap.data,
        };
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
