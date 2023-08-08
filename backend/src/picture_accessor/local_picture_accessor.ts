import PictureAccessor from './picture_accessor';
import generatePictureFilename from './filename_generator';
import JimpAdapter from './jimp_adapter';
import * as fs from 'fs';
import path from 'path';
import { JoinPictureResponse } from 'dwf-3-models-tjb';
import { Raster } from 'dwf-3-raster-tjb';

export default class LocalPictureAccessor extends PictureAccessor {
    private readonly jimpAdapter: JimpAdapter;
    private readonly prototypeFileName: string;
    private readonly baseDirectory: string;

    constructor(
        jimpAdapter: JimpAdapter,
        prototypeFileName: string,
        baseDirectory: string
    ) {
        super();

        this.jimpAdapter = jimpAdapter;
        this.prototypeFileName = prototypeFileName;
        this.baseDirectory = baseDirectory;
    }

    public async createNewPicture(
        pictureName: string,
        createdBy: string
    ): Promise<string> {
        const filename = generatePictureFilename(pictureName, createdBy);
        try {
            console.log(
                `TJTAG start copying to ${path.join(
                    this.baseDirectory,
                    filename
                )}`
            );
            await fs.promises.copyFile(
                this.prototypeFileName,
                path.join(this.baseDirectory, filename),
                fs.constants.COPYFILE_EXCL
            );
            console.log(
                `TJTAG end copying to ${path.join(
                    this.baseDirectory,
                    filename
                )}`
            );
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

        console.log(`TJTAG start reading of ${fullPath}`);
        const contents = await this.jimpAdapter.read(fullPath);
        console.log(`TJTAG end reading of ${fullPath}`);
        return {
            width: contents.bitmap.width,
            height: contents.bitmap.height,
            data: contents.bitmap.data,
        };
    }

    public async writeRaster(raster: Raster, filename: string): Promise<void> {
        //        const jimg = this.jimpAdapter.createJimp(raster.width, raster.height);
        //        // console.log(`TJTAG jimg is: ${JSON.stringify(jimg)}`);
        //        console.log(`TJTAG jimg.bitmap.data.length is: ${jimg.bitmap.data.length}`);
        //
        //        // creates a new buffer
        //        jimg.bitmap.data = Buffer.from(raster.getBuffer());
        //        console.log(`TJTAG now, jimg.bitmap.data.length is: ${JSON.stringify(jimg.bitmap.data.length)}`);

        const width = 100;
        const height = 100;
        const jimg = this.jimpAdapter.createJimp(width, height);
        // console.log(`TJTAG jimg is: ${JSON.stringify(jimg)}`);
        const arrayBuffer = new ArrayBuffer(width * height * 4);

        // const asArray = new Uint8ClampedArray(buffer);
        // creates a new buffer
        jimg.bitmap.data = Buffer.from(new Uint8ClampedArray(arrayBuffer));
        // console.log(`TJTAG now, jimg is: ${JSON.stringify(jimg)}`);

        // TJTAG TODO it gets hung up here on integ tests
        // I suspect this is brekaing
        // maybe because I'm over simplifying the creation of the image
        // so i want to print out (via tee)
        // but need to use a smaller default file <- start here
        //
        // but if i do a small raster it will write
        // maybe thats the problem here, I am doing too much copying.
        //
        // 4 X 4 works
        //
        console.log(
            `TJTAG start writing of ${path.join(this.baseDirectory, filename)}`
        );
        await jimg.writeAsync(path.join(this.baseDirectory, filename));
        console.log(
            `TJTAG end writing of ${path.join(this.baseDirectory, filename)}`
        );
    }

    public getFileSystem(): string {
        return 'LOCAL';
    }
}
