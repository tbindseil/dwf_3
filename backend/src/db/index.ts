import { Pool } from 'pg';

const pool = new Pool();

// TODO this is not transactional, see https://node-postgres.com/api/pool#poolquery
// export function query(text: string, params: string[], callback: (err: any, result: any) => void): Promise<any> {
export async function query(text: string, params: string[]): Promise<any> {
    // console.log(`query is: ${query}`);
    // console.log(`params are: ${params}`);
    try {
        return await pool.query(text, params);
    } catch (error) {
        throw error;
    }
}
