import { GetPictures } from '../../src/handlers/get_pictures';
import APIError from '../../src/handlers/api_error';
import * as db from '../../src/db';

jest.mock('../../src/db');
const mockQuery = jest.mocked(db.query, true);

describe('GetPictures Tests', () => {
    let getPictures: GetPictures;

    beforeEach(() => {
        getPictures = new GetPictures();
        mockQuery.mockClear();
    });

    it('returns empty object on getInput', () => {
        const input = getPictures.getInput({});
        expect(input).toEqual({});
    });

    it('calls db query when procesing', async () => {
        const pictureArray = {
            pictures: [{id: 1, name: 'name'}]
        };
        mockQuery.mockImplementation((query: string, params: any[]) => { query; params; return new Promise((resolve, reject) => { reject; resolve({ rows: pictureArray.pictures })}); });
        const result = await getPictures.process({});

        expect(mockQuery).toHaveBeenCalledTimes(1);
        expect(mockQuery).toHaveBeenCalledWith(`select * from picture;`, []);
        expect(result).toEqual(pictureArray);
    });

    it('throws an api error when the database query fails', async () => {
        mockQuery.mockImplementation((query: string, params: any[]) => { query; params; throw new Error(); });
        await expect(getPictures.process({})).rejects.toThrow(new APIError(500, 'database issue, pictures not fetched'));
    });
});
