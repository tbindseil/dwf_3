import LocalPictureAccessor from '../../../src/picture_accessor/local_picture_accessor';
import generatePictureFilename from '../../../src/picture_accessor/filename_generator';
import { Raster } from 'dwf-3-raster-tjb';
import * as fs from 'fs';
import path from 'path';
import Jimp from 'jimp';

jest.mock('../../../src/picture_accessor/filename_generator');
const mockGeneratePictureFilename = jest.mocked(generatePictureFilename, true);

describe('LocalPictureAccessor tests', () => {
    const width = 5;
    const height = 5;

    const mockJimpAdapter = {
        createJimp: jest.fn(),
        read: jest.fn(),
    };

    const testBaseDirectory =
        '/Users/tj/Projects/dwf_3/test_pictures/user_created/';

    const pictureName = 'pictureName';
    const createdBy = 'createdBy';
    const filename = 'filename.png';
    const fullPathFilename = path.join(testBaseDirectory, filename);

    mockGeneratePictureFilename.mockImplementation(
        (pictureName: string, createdBy: string) => {
            pictureName;
            createdBy;
            return filename;
        }
    );

    const localPictureAccessor = new LocalPictureAccessor(
        mockJimpAdapter,
        testBaseDirectory
    );

    afterEach(async () => {
        try {
            await fs.promises.unlink(fullPathFilename);
        } catch (error: unknown) {
            error;
        }
    });

    it('gives filesystem as LOCAL', () => {
        const filesystem = localPictureAccessor.getFileSystem();
        expect(filesystem).toEqual('LOCAL');
    });

    it("creates a new picture when the filename doesn't exist", async () => {
        const arrayBuffer = new ArrayBuffer(8);
        const view = new Uint8ClampedArray(arrayBuffer);
        for (let i = 0; i < 8; ++i) {
            view[i] = i;
        }
        const rasterToWrite = new Raster(1, 8, arrayBuffer);
        const mockJimg = {
            bitmap: {
                data: rasterToWrite.getBuffer(),
            },
            writeAsync: jest.fn(),
        };
        mockJimpAdapter.createJimp.mockReturnValue(mockJimg);

        await localPictureAccessor.createNewPicture(
            pictureName,
            createdBy,
            width,
            height
        );

        expect(mockJimg.writeAsync).toBeCalledWith(
            path.join(testBaseDirectory, filename)
        );
    });

    it('throws an exception when the requested filename already exists', async () => {
        // TODO do i even care? is it even possible?
        //        await localPictureAccessor.createNewPicture(
        //            pictureName,
        //            createdBy,
        //            width,
        //            height
        //        );
        //        await expect(
        //            localPictureAccessor.createNewPicture(
        //                pictureName,
        //                createdBy,
        //                width,
        //                height
        //            )
        //        ).rejects.toThrow();
    });

    it('gets the raster given the filename', async () => {
        const testPrototype =
            '/Users/tj/Projects/dwf_3/test_pictures/default/solid_white.png';
        await fs.promises.copyFile(testPrototype, fullPathFilename);
        const jimg = await Jimp.read(fullPathFilename);

        mockJimpAdapter.read.mockReturnValue(jimg);

        const joinPictureResponse = await localPictureAccessor.getRaster(
            filename
        );

        expect(joinPictureResponse).toEqual({
            width: jimg.bitmap.width,
            height: jimg.bitmap.height,
            data: jimg.bitmap.data,
        });
    });

    it('writes the raster', async () => {
        const filename = 'fn';
        const arrayBuffer = new ArrayBuffer(8);
        const view = new Uint8ClampedArray(arrayBuffer);
        for (let i = 0; i < 8; ++i) {
            view[i] = i;
        }
        const rasterToWrite = new Raster(1, 8, arrayBuffer);

        const mockJimg = {
            bitmap: {
                data: rasterToWrite.getBuffer(),
            },
            writeAsync: jest.fn(),
        };
        mockJimpAdapter.createJimp.mockReturnValue(mockJimg);

        localPictureAccessor.writeRaster(rasterToWrite, filename);

        expect(mockJimg.writeAsync).toHaveBeenCalledWith(
            path.join(testBaseDirectory, filename)
        );
    });

    it('throws when getRaster is called with a non existent file name', async () => {
        await expect(localPictureAccessor.getRaster('poopy')).rejects.toThrow();
    });
});
