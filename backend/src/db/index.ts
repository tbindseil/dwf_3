import { Knex } from 'knex';

export default interface IDB {
  query: (text: string, params: string[]) => Promise<any>
}

export class DB implements IDB {
    private readonly knex: Knex;

    constructor(knex: Knex) {
        this.knex = knex;
    }

    public async query(text: string, params: string[]): Promise<any> {
        return await this.knex.raw(text, params);
    }
}
