import LocalPictureAccessor from '../../src/picture_accessor/local_picture_accessor';
import generatePictureFilename from '../../src/picture_accessor/filename_generator';
import * as fs from 'fs';
import path from 'path';

jest.mock('../../src/picture_accessor/filename_generator');
const mockGeneratePictureFilename = jest.mocked(generatePictureFilename, true);

describe('LocalPictureAccessor tests', () => {
    const testBaseDirectory = '/Users/tj/Projects/dwf_3/test_pictures/user_created/';
    const testPrototype = '/Users/tj/Projects/dwf_3/test_pictures/default/solid_white.png';

    const pictureName = 'pictureName';
    const createdBy = 'createdBy';
    const filename = 'filename.png';
    const fullPathFilename = path.join(testBaseDirectory, filename);

    mockGeneratePictureFilename.mockImplementation((pictureName: string, createdBy: string) => { pictureName; createdBy; return filename; });

    let localPictureAccessor = new LocalPictureAccessor(testPrototype, testBaseDirectory);

    afterEach(async () => {
        try {
            await fs.promises.unlink(fullPathFilename);
        } catch (error: any) {
            error;
        }
    });

    it('gives filesystem as LOCAL', () => {
        const filesystem = localPictureAccessor.getFileSystem();
        expect(filesystem).toEqual('LOCAL');
    });

    it('creates a copy of the prototype when the filename doesn\'t exist', async () => {
        await localPictureAccessor.createNewPicture(pictureName, createdBy);

        const newFileContents = await fs.promises.readFile(fullPathFilename);
        const prototypeFileContents = await fs.promises.readFile(testPrototype);

        expect(newFileContents).toEqual(prototypeFileContents);
    });

    it('throws an exception when the requested filename already exists', async () => {
        await localPictureAccessor.createNewPicture(pictureName, createdBy);
        await expect(localPictureAccessor.createNewPicture(pictureName, createdBy)).rejects.toThrow();
    });
});
