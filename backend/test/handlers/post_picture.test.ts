import { PostPicture } from '../../src/handlers/post_picture';
import APIError from '../../src/handlers/api_error';
import * as db from '../../src/db';
import LocalPictureAccessor from '../../src/picture_accessor/local_picture_accessor';

jest.mock('../../src/db');
const mockQuery = jest.mocked(db.query, true);
jest.mock('../../src/picture_accessor/local_picture_accessor');
const mockLocalPictureAccessor = jest.mocked(LocalPictureAccessor, true);

describe('PostPicture Tests', () => {
    const name = 'name';
    const createdBy = 'createdBy';
    const body = { name: name, createdBy: createdBy };

    const prototypeFileName = 'prototypeFileName';
    const baseDirectory = 'baseDirectory';
    let mockLocalPictureAccessorInstance: LocalPictureAccessor;

    let postPicture: PostPicture;

    beforeEach(() => {
        mockQuery.mockClear();
        mockLocalPictureAccessor.mockClear();
        mockLocalPictureAccessorInstance = new LocalPictureAccessor(prototypeFileName, baseDirectory);
        postPicture = new PostPicture(mockLocalPictureAccessorInstance);
    });

    it('gets the name and createdBy from the input', () => {
        const returned = postPicture.getInput(body);
        expect(returned).toEqual(body);
    });

    it('throws when input doesn\'t have a name field', async () => {
        expect(() => postPicture.getInput({})).toThrow(new APIError(400, 'name and created by must be provided, picture not created'));
    });

    it('throws when input doesn\'t have a createdBy field', async () => {
        expect(() => postPicture.getInput({})).toThrow(new APIError(400, 'name and created by must be provided, picture not created'));
    });

    it('creates a new image with the expected createdBy', async () => {
        const mockCreateNewPicture = mockLocalPictureAccessorInstance.createNewPicture as jest.Mock;

        await postPicture.process(body);

        expect(mockCreateNewPicture).toHaveBeenCalledTimes(1);
        expect(mockCreateNewPicture).toHaveBeenCalledWith(name, createdBy);
    });

    it('calls db query when procesing', async () => {
        const filename = 'filename';
        const filesystem = 'filesystem';
        const mockCreateNewPicture = mockLocalPictureAccessorInstance.createNewPicture as jest.Mock;
        mockCreateNewPicture.mockImplementation((pictureName: string, createdBy: string) => { pictureName; createdBy; return filename; });
        const mockGetFileSystem = mockLocalPictureAccessorInstance.getFileSystem as jest.Mock;
        mockGetFileSystem.mockImplementation(() => { return filesystem; });

        await postPicture.process(body);

        const expectedQuery = 'insert into picture (name, createdBy, filename, filesystem) values ($1, $2, $3, $4);'
        const expectedParams = [name, createdBy, filename, filesystem];
        expect(mockQuery).toHaveBeenCalledTimes(1);
        expect(mockQuery).toHaveBeenCalledWith(expectedQuery, expectedParams);
    });

    it('throws an api error when the creation of the new picture fails', async () => {
        const mockCreateNewPicture = mockLocalPictureAccessorInstance.createNewPicture as jest.Mock;
        mockCreateNewPicture.mockImplementation((pictureName: string, createdBy: string) => { pictureName; createdBy; throw new Error(); });
        await expect(postPicture.process(body)).rejects.toThrow(new APIError(500, 'database issue, picture not created'));
    });

    it('throws an api error when the database query fails', async () => {
        mockQuery.mockImplementation((query: string, params: any[]) => { query; params; throw new Error(); });
        await expect(postPicture.process(body)).rejects.toThrow(new APIError(500, 'database issue, picture not created'));
    });
});
