import Knex from "knex";

export const database = 'test_picture_database'

// TODO really this should be knex_without_database
export const knex = Knex({
    client: 'pg',
    connection: {
        host: 'localhost',
        port: 5432,
        user: 'tj'
    },
    searchPath: ['knex', 'public'],
    debug: true
})

export const knex_with_database = Knex({
    client: 'pg',
    connection: {
        host: 'localhost',
        port: 5432,
        database,
        user: 'tj'
    },
    searchPath: ['knex', 'public'],
    debug: true
});
