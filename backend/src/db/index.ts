import { Pool } from 'pg';

const pool = new Pool();

// TODO this is not transactional, see https://node-postgres.com/api/pool#poolquery
export async function query(text: string, params: string[]): Promise<any> {
    try {
        return await pool.query(text, params);
    } catch (error) {
        throw error;
    }
}
