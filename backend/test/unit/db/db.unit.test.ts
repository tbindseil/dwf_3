import Knex from 'knex';
import { DB } from '../../../src/db';

describe('DB Tests', () => {
    const knexReturnValue = {
        out_put: {
            out_put: {
                out_put: 'out_put',
            },
        },
    };
    const mockKnexRaw = jest.fn();
    const mockKnex = {
        raw: mockKnexRaw,
        destroy: jest.fn(),
    } as unknown as ReturnType<typeof Knex>;

    const mockMakeKnex = jest.fn();
    mockMakeKnex.mockReturnValue(mockKnex);

    const db = new DB(mockMakeKnex);

    const query = 'query';
    const params = ['list', 'of', 'params'];

    beforeEach(() => {
        mockKnexRaw.mockClear();
        mockKnexRaw.mockReturnValue(knexReturnValue);
    });

    it('queries', async () => {
        await db.query(query, params);

        expect(mockKnex.raw).toHaveBeenCalledWith(query, params);
        expect(mockKnex.destroy).toHaveBeenCalled();
    });

    it('converts camel to snake on the way in', async () => {
        await db.query(query, params);

        expect(mockKnex.raw).toHaveBeenCalledWith(query, params);
        expect(mockKnex.destroy).toHaveBeenCalled();
    });

    it.only('converts snake to camel on the way out', async () => {
        const expectedReturnValue = {
            outPut: {
                outPut: {
                    outPut: 'out_put',
                },
            },
        };

        const actual = await db.query(query, params);

        expect(actual).toEqual(expectedReturnValue);
    });
});
