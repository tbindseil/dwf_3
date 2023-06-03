import { PostPicture } from '../../../src/handlers/post_picture';
import LocalPictureAccessor from '../../../src/picture_accessor/local_picture_accessor';
import { Ajv } from '../mock/utils';
import { _schema } from 'dwf-3-models-tjb';
import PictureObjectionModel from '../../../src/handlers/picture_objection_model';
import { QueryBuilder } from 'objection';

jest.mock('../../../src/picture_accessor/local_picture_accessor');
const mockLocalPictureAccessor = jest.mocked(LocalPictureAccessor, true);

jest.mock('../../../src/handlers/picture_objection_model');
const mockPictureObjectionModel = jest.mocked(PictureObjectionModel, true);

describe('PostPicture Tests TJTAG', () => {
    const name = 'name';
    const createdBy = 'createdBy';
    const body = { name: name, createdBy: createdBy };

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
        mockPictureObjectionModel.mockClear();
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
        } as unknown as QueryBuilder<PictureObjectionModel>;
        mockPictureObjectionModel.query.mockReturnValue(mockQueryBuilder);

        await postPicture.process(body);

        expect(mockCreateNewPicture).toHaveBeenCalledTimes(1);
        expect(mockCreateNewPicture).toHaveBeenCalledWith(name, createdBy);
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
        } as unknown as QueryBuilder<PictureObjectionModel>;
        mockPictureObjectionModel.query.mockReturnValue(mockQueryBuilder);

        await postPicture.process(body);

        expect(mockInsert).toHaveBeenCalledWith({
            name: name,
            created_by: createdBy,
            filename: filename,
            filesystem: filesystem,
        });
    });

    it('provides input validator', () => {
        const validator = postPicture.provideInputValidationSchema();
        const expectedValidator = Ajv.compile(_schema.GetPictureInput);

        expect(validator.schema).toEqual(expectedValidator.schema);
    });
});
