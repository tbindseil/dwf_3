import { GetPictures } from '../../../src/handlers/get_pictures';
import { Ajv, mockKnex } from '../mock/utils';
import { Picture, _schema } from 'dwf-3-models-tjb';
import { ValidateFunction } from 'ajv';

jest.mock('dwf-3-models-tjb');
const mockPicture = jest.mocked(Picture, true);

describe('GetPictures Tests', () => {
    let getPictures: GetPictures;

    beforeEach(() => {
        getPictures = new GetPictures();
        mockPicture.mockClear();
    });

    it('calls db query when procesing', async () => {
        const expectedPictures = [
            {
                id: 42,
                name: 'name',
                createdBy: 'createdBy',
                filename: 'filename',
                filesystem: 'filesystem',
            },
            {
                id: 43,
                name: 'name_2',
                createdBy: 'createdBy',
                filename: 'filename_2',
                filesystem: 'filesystem_2',
            },
        ];
        mockPicture.query = jest.fn().mockResolvedValue(expectedPictures);

        const result = await getPictures.process({}, mockKnex);

        expect(result.pictures).toEqual(expectedPictures);
    });

    it('provides input validator', () => {
        const validator = getPictures.provideInputValidationSchema();

        // for some reason the {} object schema is being weird
        // const expectedValidator = (() => true) as unknown as ValidateFunction;
        const expectedValidator = Ajv.compile(_schema.GetPicturesInput);

        expect(validator.schema).toEqual(expectedValidator.schema);
    });
});
