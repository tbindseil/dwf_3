import { Pool } from 'pg';

// TODO might be able to remove
const pg = require('knex')({
    client: 'pg',
    // connection: process.env.PG_CONNECTION_STRING, not useful
    searchPath: ['knex', 'public'],
    connection: async () => {
        // TODO determine dev or not
        return {
            debug: true,
            asyncStackTraces: true
        };
    },

    // set min to 0 so all idle connections can be terminated
    pool: {
        min: 0, max: 10
    }
});

export default interface IDB {
  query: (text: string, params: string[]) => Promise<any>
}

export class DB implements IDB {
    private readonly pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    // TODO this is not transactional, see https://node-postgres.com/api/pool#poolquery
    public async query(text: string, params: string[]): Promise<any> {
        return await this.pool.query(text, params);
    }
}
