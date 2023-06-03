// TODO can i remove the *.unit.* and *.integ.* now that I have folders?
import { GetPictures } from '../../../src/handlers/get_pictures';
import { Ajv } from '../mock/utils';
import { Picture, _schema } from 'dwf-3-models-tjb';
import PictureObjectionModel from '../../../src/handlers/picture_objection_model';

jest.mock('../../../src/handlers/picture_objection_model');
const mockPictureObjectionModel = jest.mocked(PictureObjectionModel, true);

describe('GetPictures Tests', () => {
    let getPictures: GetPictures;

    beforeEach(() => {
        getPictures = new GetPictures();
    });

    it('calls db query when procesing', async () => {
        const expectedPictures = [
            {
                id: 42,
                name: 'name',
                created_by: 'created_by',
                filename: 'filename',
                filesystem: 'filesystem',
            },
            {
                id: 43,
                name: 'name_2',
                created_by: 'created_by_2',
                filename: 'filename_2',
                filesystem: 'filesystem_2',
            },
        ];
        mockPictureObjectionModel.query = jest
            .fn()
            .mockResolvedValue(expectedPictures);

        const result = await getPictures.process({});
        const mapped = result.pictures.map(
            (value: Picture): { [key: string]: string | number } => {
                return {
                    id: value.id,
                    name: value.name,
                    created_by: value.createdBy,
                    filename: value.filename,
                    filesystem: value.filesystem,
                };
            }
        );

        expect(mapped).toEqual(expectedPictures);
    });

    it('provides input validator', () => {
        const validator = getPictures.provideInputValidationSchema();
        const expectedValidator = Ajv.compile(_schema.GetPictureInput);

        expect(validator.schema).toEqual(expectedValidator.schema);
    });
});
