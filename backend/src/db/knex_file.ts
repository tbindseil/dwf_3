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
    debug: true
};

export const knex = Knex({
    ...knexBaseConfig,
    connection: connectionConfig
});

export const knexWithoutDatabase = Knex({
    ...knexBaseConfig,
    connection: connectionConfigWithoutDatabase
});
