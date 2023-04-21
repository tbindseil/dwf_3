import {DB} from '../../src/db';
import {Pool} from "pg";

describe('DB Tests', () => {
    it('queries', async () => {
        const mockPool = {
            query: jest.fn()
        } as unknown as Pool;
        const db = new DB(mockPool);

        const query = 'query';
        const params = ['list', 'of', 'params'];
        db.query(query, params);

        expect(mockPool.query).toHaveBeenCalledWith(query, params);
    });
});
