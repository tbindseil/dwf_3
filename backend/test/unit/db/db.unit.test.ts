import Knex from 'knex';
import { DB } from '../../../src/db';

describe('DB Tests', () => {
    // the snake to camel mechanism does it in place...
    const makeKnexReturnValue = () => {
        return {
            out_put: {
                out_put: {
                    out_put: 'out_put',
                    outPut: 'out put',
                },
            },
        };
    };
    const query = 'query';
    const params = ['list', 'of', 'params'];

    const mockKnexRaw = jest.fn();
    const mockKnexDestroy = jest.fn();

    const mockKnex = {
        raw: mockKnexRaw,
        destroy: mockKnexDestroy,
    } as unknown as ReturnType<typeof Knex>;

    const mockMakeKnex = jest.fn();
    mockMakeKnex.mockReturnValue(mockKnex);

    const db = new DB(mockMakeKnex);

    beforeEach(() => {
        mockKnexRaw.mockClear();
        mockKnexRaw.mockReturnValue(makeKnexReturnValue());
    });

    it('queries', async () => {
        await db.query(query, params);

        expect(mockKnexRaw).toHaveBeenCalledWith(query, params);
        expect(mockKnexDestroy).toHaveBeenCalled();
    });

    // still having the handlers pass free strings and params (ie not type magic),
    // so no need to do this conversion (yet)
    //     it('converts camel to snake on the way in', async () => {
    //         await db.query(query, params);
    //
    //     });

    it('converts snake to camel on the way out', async () => {
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
