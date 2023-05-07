import Knex from 'knex';

const developmentDatabase = 'tj';
export const testDatabase = 'test_picture_database'


const env = process.env.ENV || 'DEV';

const databaseMap: any = {
    'DEV': developmentDatabase,
    'TEST': testDatabase
};

const database = databaseMap[env];

const connectionConfigWithoutDatabase = {
    host: 'localhost',
    port: 5432,
    user: 'tj'
};

const connectionConfig = {
    ...connectionConfigWithoutDatabase,
    database
}

const knexBaseConfig = {
    client: 'pg',
    searchPath: ['knex', 'public'],
    pool: { min: 0, max: 7 },
    idleTimeoutMillis: 50, // TODO this should be different for dev, this is for testing to end quickly
    debug: true
};

export const makeKnex = () => Knex({
    ...knexBaseConfig,
    connection: connectionConfig
});

export const makeKnexWithoutDatabase = () => Knex({
    ...knexBaseConfig,
    connection: connectionConfigWithoutDatabase
});


// TODO might need to vend the factory and have users close after usage?
