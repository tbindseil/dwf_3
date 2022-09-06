import { Pool } from 'pg';

const pool = new Pool();

// TODO this is not transactional, see https://node-postgres.com/api/pool#poolquery
export function query(text: string, params: string[], callback: (err: any, result: any) => void): void {
    console.log(`query is: ${query}`);
    console.log(`params are: ${params}`);
    return pool.query(text, params, callback);
}
