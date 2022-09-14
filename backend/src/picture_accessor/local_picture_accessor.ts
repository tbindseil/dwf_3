import PictureAccessor from './picture_accessor';
import generatePictureFilename from './filename_generator';
import * as fs from 'fs';
import path from 'path';

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

    public getFileSystem(): string {
        return 'LOCAL';
    }
}
