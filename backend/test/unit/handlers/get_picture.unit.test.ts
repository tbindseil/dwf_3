import { GetPictureObjection } from '../../../src/handlers/get_picture';
import LocalPictureAccessor from '../../../src/picture_accessor/local_picture_accessor';
import { GetPictureInput, _schema } from 'dwf-3-models-tjb';
import { Ajv } from '../mock/utils';

import PictureObjectionModel from '../../../src/handlers/picture_objection_model';
import { QueryBuilder } from 'objection';

jest.mock('../../../src/picture_accessor/local_picture_accessor');
const mockLocalPictureAccessor = jest.mocked(LocalPictureAccessor, true);

jest.mock('../../../src/handlers/picture_objection_model');
const mockPictureObjectionModel = jest.mocked(PictureObjectionModel, true);

describe('GetPictureObjection Tests', () => {
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

    let getPictureObjection: GetPictureObjection;

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
        getPictureObjection = new GetPictureObjection(
            mockLocalPictureAccessorInstance
        );
    });

    it('gets the filename from the database, requests picture contents, and returns them', async () => {
        const expectedPicture = {
            id: 42,
            name: 'name',
            created_by: 'created_by',
            filename: 'filename',
            filesystem: 'filesystem',
        };
        const mockFindById = jest.fn().mockReturnValue(expectedPicture);
        const mockQueryBuilder = {
            findById: mockFindById,
        } as unknown as QueryBuilder<PictureObjectionModel>;
        mockPictureObjectionModel.query.mockReturnValue(mockQueryBuilder);

        const expectedContents = 'expectedContents';
        const mockGetPicture =
            mockLocalPictureAccessorInstance.getPicture as jest.Mock;
        mockGetPicture.mockImplementation((filename: string) => {
            if (filename === expectedPicture.filename) {
                return expectedContents;
            } else {
                console.log(`filename is: ${filename}`);
                throw new Error();
            }
        });

        const results = await getPictureObjection.process(body);

        expect(results).toEqual(expectedContents);
    });

    it('gives png content type by default', () => {
        const contentType = getPictureObjection.getContentType();
        expect(contentType).toEqual('image/png');
    });

    it('provides input validator', () => {
        const validator = getPictureObjection.provideInputValidationSchema();
        const expectedValidator = Ajv.compile(_schema.GetPictureInput);

        expect(validator.schema).toEqual(expectedValidator.schema);
    });

    it('uses passthrough output serialization by default', () => {
        const superCrazyOutput = { thing1: 'thing1key', thing2: 'thing2key' };
        const superCrazyOutputBuffer = Buffer.from(
            JSON.stringify(superCrazyOutput),
            'utf-8'
        );

        const resultingSerializedOutput = getPictureObjection.serializeOutput(
            superCrazyOutputBuffer
        );
        expect(resultingSerializedOutput).toEqual(superCrazyOutputBuffer);
    });
});
