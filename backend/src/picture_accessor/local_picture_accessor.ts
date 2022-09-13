import PictureAccessor from './picture_accessor';
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

    public async createNewPicture(filename: string): Promise<void> {
        try {
            await fs.promises.copyFile(this.prototypeFileName, path.join(this.baseDirectory, filename), fs.constants.COPYFILE_EXCL);
        } catch (error: any) {
            console.log(`issue creating new picture: ${JSON.stringify(error)}`);
            throw error;
        }
    }
}
