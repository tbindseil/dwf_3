import { Knex } from 'knex'

export default interface IDB {
    query: (text: string, params: string[]) => Promise<any>
}

export class DB implements IDB {
    private readonly makeKnex: () => Knex

    constructor(knex: () => Knex) {
        this.makeKnex = knex
    }

    public async query(text: string, params: string[]): Promise<any> {
        const scopedKnex = this.makeKnex()
        const ret = await scopedKnex.raw(text, params)
        scopedKnex.destroy()
        return ret
    }
}
