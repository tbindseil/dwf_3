import { PostPicture } from '../../../src/handlers/post_picture';
import LocalPictureAccessor from '../../../src/picture_accessor/local_picture_accessor';
import { Ajv, mockKnex } from '../utils/mocks';
import { Picture, _schema } from 'dwf-3-models-tjb';
import { QueryBuilder } from 'objection';

jest.mock('../../../src/picture_accessor/local_picture_accessor');
const mockLocalPictureAccessor = jest.mocked(LocalPictureAccessor, true);

jest.mock('dwf-3-models-tjb');
const mockPicture = jest.mocked(Picture, true);

describe('PostPicture Tests', () => {
    const name = 'name';
    const createdBy = 'createdBy';
    const width = 5;
    const height = 5;
    const body = { name, createdBy, width, height };

    const mockJimpAdapter = {
        createJimp: jest.fn(),
        read: jest.fn(),
    };
    const prototypeFileName = 'prototypeFileName';
    const baseDirectory = 'baseDirectory';
    let mockLocalPictureAccessorInstance: LocalPictureAccessor;

    let postPicture: PostPicture;

    beforeEach(() => {
        mockLocalPictureAccessor.mockClear();
        mockPicture.mockClear();
        mockJimpAdapter.createJimp.mockClear();
        mockJimpAdapter.read.mockClear();
        mockLocalPictureAccessorInstance = new LocalPictureAccessor(
            mockJimpAdapter,
            prototypeFileName,
            baseDirectory
        );
        postPicture = new PostPicture(mockLocalPictureAccessorInstance);
    });

    it('creates a new image with the expected createdBy', async () => {
        const mockCreateNewPicture =
            mockLocalPictureAccessorInstance.createNewPicture as jest.Mock;

        const mockInsert = jest.fn();
        const mockQueryBuilder = {
            insert: mockInsert,
        } as unknown as QueryBuilder<Picture>;
        mockPicture.query.mockReturnValue(mockQueryBuilder);

        await postPicture.process(body, mockKnex);

        expect(mockCreateNewPicture).toHaveBeenCalledTimes(1);
        expect(mockCreateNewPicture).toHaveBeenCalledWith(
            name,
            createdBy,
            5,
            5
        );
    });

    it('calls db query when procesing', async () => {
        const filename = 'filename';
        const filesystem = 'filesystem';
        const mockCreateNewPicture =
            mockLocalPictureAccessorInstance.createNewPicture as jest.Mock;
        mockCreateNewPicture.mockImplementation(
            (pictureName: string, createdBy: string) => {
                pictureName;
                createdBy;
                return filename;
            }
        );
        const mockGetFileSystem =
            mockLocalPictureAccessorInstance.getFileSystem as jest.Mock;
        mockGetFileSystem.mockImplementation(() => {
            return filesystem;
        });

        const mockInsert = jest.fn();
        const mockQueryBuilder = {
            insert: mockInsert,
        } as unknown as QueryBuilder<Picture>;
        mockPicture.query.mockReturnValue(mockQueryBuilder);

        await postPicture.process(body, mockKnex);

        expect(mockInsert).toHaveBeenCalledWith({
            name: name,
            createdBy: createdBy,
            filename: filename,
            filesystem: filesystem,
        });
    });

    it('provides input validator', () => {
        const validator = postPicture.provideInputValidationSchema();
        const expectedValidator = Ajv.compile(_schema);
        expect(validator.schema).toEqual(expectedValidator.schema);
    });
});
