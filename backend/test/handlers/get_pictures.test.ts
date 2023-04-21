import { GetPictures } from '../../src/handlers/get_pictures';
import APIError from '../../src/handlers/api_error';
import IDB from '../../src/db';

// jest.mock('../../src/db');
// const mockQuery = jest.mocked(db.query, true);
// jest.mock('../../src/db');
// const mockQuery = jest.mocked(DB.query, true);
// const mockDB = jest.genMockFromModule<DB>('db');
// const mockDB = jest.mock<DB>('db');
// mockDB.
const mockQuery = jest.fn();
const mockDB = {
    query: mockQuery
} as IDB;

describe('GetPictures Tests', () => {
    let getPictures: GetPictures;

    beforeEach(() => {
        getPictures = new GetPictures(mockDB);
        mockQuery.mockClear();
    });

    it('returns empty object on getInput', () => {
        const input = getPictures.getInput({});
        expect(input).toEqual({});
    });

    it('calls db query when procesing', async () => {
        const dbQueryOutput = {
            pictures: [{id: 1, name: 'name', createdby: 'createdBy', filename: 'filename', filesystem: 'filesystem'}]
        };

        const pictureArray = {
            pictures: [{id: 1, name: 'name', createdBy: 'createdBy', filename: 'filename', filesystem: 'filesystem'}]
        };
        mockQuery.mockImplementation((query: string, params: any[]) => { query; params; return new Promise((resolve, reject) => { reject; resolve({ rows: dbQueryOutput.pictures })}); });
        const result = await getPictures.process(mockDB, {});

        expect(mockQuery).toHaveBeenCalledTimes(1);
        expect(mockQuery).toHaveBeenCalledWith(`select * from picture;`, []);
        expect(result).toEqual(pictureArray);
    });

    it('throws an api error when the database query fails', async () => {
        mockQuery.mockImplementation((query: string, params: any[]) => { query; params; throw new Error(); });
        await expect(getPictures.process(mockDB, {})).rejects.toThrow(new APIError(500, 'database issue, pictures not fetched'));
    });
});
