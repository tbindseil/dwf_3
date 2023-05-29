import { Knex } from 'knex';

// heads up! This is in place
const snakeToCamelKeys = (value: { [key: string]: any }) => {
    Object.keys(value).forEach((key: string) => {
        const camelKey = snakeToCamel(key);
        value[camelKey] = value[key];
        delete value[key];

        if (typeof value[camelKey] === 'object') {
            snakeToCamelKeys(value[camelKey]);
        }
    });
    return value;
};

const snakeToCamel = (value: string): string => {
    const tokens = value.split('_');
    for (let i = 1; i < tokens.length; ++i) {
        tokens[i] = tokens[i].charAt(0).toUpperCase() + tokens[i].slice(1);
    }
    return tokens.join('');
};

// TODO how to handle 'any' here?
export default interface IDB {
    query: (text: string, params: string[]) => Promise<any>;
}

export class DB implements IDB {
    private readonly makeKnex: () => Knex;

    constructor(knex: () => Knex) {
        this.makeKnex = knex;
    }

    public async query(text: string, params: string[]): Promise<any> {
        const scopedKnex = this.makeKnex();
        const ret = await scopedKnex.raw(text, params);
        scopedKnex.destroy();
        snakeToCamelKeys(ret);
        return ret;
    }
}
