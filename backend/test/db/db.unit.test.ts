import Knex from 'knex';
import {DB} from '../../src/db';

describe('DB Tests', () => {
    it('queries', async () => {
        const mockKnex = {
            raw: jest.fn()
        } as unknown as ReturnType<typeof Knex>;

        const db = new DB(mockKnex);

        const query = 'query';
        const params = ['list', 'of', 'params'];
        db.query(query, params);

        expect(mockKnex.raw).toHaveBeenCalledWith(query, params);
    });
});
