import { GetPicture } from '../../../src/handlers/get_picture';
import LocalPictureAccessor from '../../../src/picture_accessor/local_picture_accessor';
import { GetPictureInput, Picture, _schema } from 'dwf-3-models-tjb';
import { Ajv, mockKnex } from '../mock/utils';
import { QueryBuilder } from 'objection';
import APIError from '../../../src/handlers/api_error';

jest.mock('../../../src/picture_accessor/local_picture_accessor');
const mockLocalPictureAccessor = jest.mocked(LocalPictureAccessor, true);

jest.mock('dwf-3-models-tjb');
const mockPicture = jest.mocked(Picture, true);

describe('GetPicture Tests', () => {
    const id = 42;
    const body: GetPictureInput = { id: id };

    // TODO this picture accessor mock stuff is duplicated
    // also, its probably only necessary to mock a PictureAccessor, not a LocalPictureAccessor
    const mockJimpAdapter = {
        createJimp: jest.fn(),
        read: jest.fn(),
    };
    const prototypeFileName = 'prototypeFileName';
    const baseDirectory = 'baseDirectory';
    let mockLocalPictureAccessorInstance: LocalPictureAccessor;

    let getPicture: GetPicture;

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
        getPicture = new GetPicture(mockLocalPictureAccessorInstance);
    });

    it('gets the filename from the database, requests picture contents, and returns them', async () => {
        const expectedPicture = {
            id: 42,
            name: 'name',
            createdBy: 'createdBy',
            filename: 'filename',
            filesystem: 'filesystem',
        };
        const mockFindById = jest.fn().mockReturnValue(expectedPicture);
        const mockQueryBuilder = {
            findById: mockFindById,
        } as unknown as QueryBuilder<Picture>;
        mockPicture.query.mockReturnValue(mockQueryBuilder);

        const expectedContents = 'expectedContents';
        const mockGetPicture =
            mockLocalPictureAccessorInstance.getPicture as jest.Mock;
        mockGetPicture.mockImplementation((filename: string) => {
            if (filename === expectedPicture.filename) {
                return expectedContents;
            } else {
                throw new Error();
            }
        });

        const results = await getPicture.process(body, mockKnex);

        expect(results).toEqual(expectedContents);
    });

    it('throws when the picture is not found', async () => {
        const mockFindById = jest.fn().mockReturnValue(null);
        const mockQueryBuilder = {
            findById: mockFindById,
        } as unknown as QueryBuilder<Picture>;
        mockPicture.query.mockReturnValue(mockQueryBuilder);

        await expect(getPicture.process(body, mockKnex)).rejects.toThrow(
            new APIError(400, 'picture not found')
        );
    });

    it('gives png content type by default', () => {
        const contentType = getPicture.getContentType();
        expect(contentType).toEqual('image/png');
    });

    it('provides input validator', () => {
        const validator = getPicture.provideInputValidationSchema();
        const expectedValidator = Ajv.compile(_schema.GetPictureInput);

        expect(validator.schema).toEqual(expectedValidator.schema);
    });

    it('uses passthrough output serialization by default', () => {
        const superCrazyOutput = { thing1: 'thing1key', thing2: 'thing2key' };
        const superCrazyOutputBuffer = Buffer.from(
            JSON.stringify(superCrazyOutput),
            'utf-8'
        );

        const resultingSerializedOutput = getPicture.serializeOutput(
            superCrazyOutputBuffer
        );
        expect(resultingSerializedOutput).toEqual(superCrazyOutputBuffer);
    });
});
