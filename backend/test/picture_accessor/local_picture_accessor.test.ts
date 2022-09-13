import LocalPictureAccessor from '../../src/picture_accessor/local_picture_accessor';
import * as fs from 'fs';
import path from 'path';


describe('LocalPictureAccessor tests', () => {
    const testBaseDirectory = '/Users/tj/Projects/dwf_3/test_pictures/user_created/';
    const testPrototype = '/Users/tj/Projects/dwf_3/test_pictures/default/solid_white.png';

    const filename = 'filename.png';
    const fullPathFilename = path.join(testBaseDirectory, filename);

    let localPictureAccessor = new LocalPictureAccessor(testPrototype, testBaseDirectory);

    afterEach(async () => {
        await fs.promises.unlink(fullPathFilename);
    });

    it('creates a copy of the prototype when the filename doesn\'t exist', async () => {
        await localPictureAccessor.createNewPicture(filename);

        const newFileContents = await fs.promises.readFile(fullPathFilename);
        const prototypeFileContents = await fs.promises.readFile(testPrototype);

        expect(newFileContents).toEqual(prototypeFileContents);
    });

    it('throws an exception when the requested filename already exists', async () => {
        await localPictureAccessor.createNewPicture(filename);
        await expect(localPictureAccessor.createNewPicture(filename)).rejects.toThrow();
    });
});
