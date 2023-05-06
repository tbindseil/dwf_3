import Knex from "knex";

export const database = 'test_picture_database'

export const knex = Knex({
    client: 'pg',
    connection: {
        host: 'localhost',
        port: 5432,
    },
})
