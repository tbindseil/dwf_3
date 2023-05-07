import Knex from 'knex';
import {DB} from '../../src/db';

describe('DB Tests', () => {
    it('queries', async () => {
        const mockKnex = {
            raw: jest.fn(),
            destroy: jest.fn()
        } as unknown as ReturnType<typeof Knex>;

        const mockMakeKnex = jest.fn();
        mockMakeKnex.mockReturnValue(mockKnex);

        const db = new DB(mockMakeKnex);

        const query = 'query';
        const params = ['list', 'of', 'params'];
        await db.query(query, params);

        expect(mockKnex.raw).toHaveBeenCalledWith(query, params);
        expect(mockKnex.destroy).toHaveBeenCalled();
    });
});
