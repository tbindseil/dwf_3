import { Pool } from 'pg';

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
