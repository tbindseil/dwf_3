// TODO can i remove the *.unit.* and *.integ.* now that I have folders?
import { GetPictures } from '../../../src/handlers/get_pictures';
import APIError from '../../../src/handlers/api_error';
import IDB from '../../../src/db';
import { Ajv, mockNext } from '../mock/utils';
import { _schema } from 'dwf-3-models-tjb';

// jest.mock('../../src/db');
// const mockQuery = jest.mocked(db.query, true);
// jest.mock('../../src/db');
// const mockQuery = jest.mocked(DB.query, true);
// const mockDB = jest.genMockFromModule<DB>('db');
// const mockDB = jest.mock<DB>('db');
// mockDB.
const mockQuery = jest.fn();
const mockDB = {
    query: mockQuery,
} as IDB;

describe('GetPictures Tests', () => {
    let getPictures: GetPictures;

    beforeEach(() => {
        getPictures = new GetPictures(mockDB);
        mockQuery.mockClear();
    });

    it.only('calls db query when procesing', async () => {
        const dbQueryOutput = {
            pictures: [
                {
                    id: 1,
                    name: 'name',
                    createdBy: 'createdBy',
                    filename: 'filename',
                    filesystem: 'filesystem',
                },
            ],
        };

        mockQuery.mockImplementation((query: string, params: any[]) => {
            query;
            params;
            return new Promise((resolve, reject) => {
                reject;
                resolve({ rows: dbQueryOutput.pictures });
            });
        });
        const result = await getPictures.process(mockDB, {}, mockNext);

        expect(mockQuery).toHaveBeenCalledTimes(1);
        expect(mockQuery).toHaveBeenCalledWith(`select * from picture;`, []);
        expect(result).toEqual(dbQueryOutput);
    });

    it('throws an api error when the database query fails', async () => {
        mockQuery.mockImplementation((query: string, params: any[]) => {
            query;
            params;
            throw new Error();
        });
        await expect(getPictures.process(mockDB, {}, mockNext)).rejects.toThrow(
            new APIError(500, 'database issue, pictures not fetched')
        );
    });

    it('provides input validator', () => {
        const validator = getPictures.provideInputValidationSchema();
        const expectedValidator = Ajv.compile(_schema.GetPictureInput);

        expect(validator.schema).toEqual(expectedValidator.schema);
    });
});
