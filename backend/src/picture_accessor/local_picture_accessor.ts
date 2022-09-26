import PictureAccessor from './picture_accessor';
import generatePictureFilename from './filename_generator';
import * as fs from 'fs';
import path from 'path';
import Jimp from 'jimp';
import { PictureResponse } from 'dwf-3-models-tjb';
import { Raster } from 'dwf-3-raster-tjb';

export default class LocalPictureAccessor extends PictureAccessor {
    private readonly prototypeFileName: string;
    private readonly baseDirectory: string;

    constructor(prototypeFileName: string, baseDirectory: string) {
        super();
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

    public async getPicture(filename: string): Promise<Buffer> {
        try {
            return await fs.promises.readFile(path.join(this.baseDirectory, filename));
        } catch (error: any) {
            console.log(`issue reading picture contents, ${JSON.stringify(error)}`);
            throw error;
        }
    }

    public async getRaster(filename: string): Promise<PictureResponse> {
        const contents = await Jimp.read(path.join(this.baseDirectory, filename))
        return {
            width: contents.bitmap.width,
            height: contents.bitmap.height,
            data: contents.bitmap.data
        };
    }

    public async writeRaster(raster: Raster): Promise<void> {
        // await Jimp.write('writter_from_raster.png');
        // new Jimp({data: raster.getBuffer(), raster.width, raster.height}, (err, image) => {
            // image.write('writter_from_raster');
        // });

        const jimg = new Jimp(raster.width, raster.height);
        jimg.bitmap.data = new Buffer(raster.getBuffer());
        jimg.write('writter_from_raster.png');
        // jjimg.getBuffer(Jimp.MIME_PNG, (err, result) => {
            // jres.set('Content-Type', Jimp.MIME_PNG);
            // res.send(result);
        // });
    }

    public getFileSystem(): string {
        return 'LOCAL';
    }
}
