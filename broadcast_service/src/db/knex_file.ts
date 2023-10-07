import Knex from 'knex';

const developmentDatabase = 'tj';
export const testDatabase = 'test_picture_database';

// package.json exports the env var for integ test
const env = process.env.ENV || 'DEV';

const databaseMap: { [key: string]: string } = {
    DEV: developmentDatabase,
    TEST: testDatabase,
};

const database = databaseMap[env];

const connectionConfigWithoutDatabase = {
    host: 'localhost',
    port: 5432,
    user: 'tj',
};

const connectionConfig = {
    ...connectionConfigWithoutDatabase,
    database,
};

const knexBaseConfig = {
    client: 'pg',
    searchPath: ['knex', 'public'],
    pool: { min: 0, max: 7 },
    migrations: {
        directory: '/Users/tj/Projects/dwf_3/backend/build/src/db/migrations',
    },
    seeds: {
        directory: '/Users/tj/Projects/dwf_3/backend/build/test/integ/db/seeds',
    },
    debug: true,
};

export const knexConfig = {
    ...knexBaseConfig,
    connection: connectionConfig,
};

export const makeKnex = () => Knex(knexConfig);

export const makeKnexWithoutDatabase = () =>
    Knex({
        ...knexBaseConfig,
        connection: connectionConfigWithoutDatabase,
    });
