import { Knex } from 'knex';

exports.up = async function (knex: Knex) {
    await knex.schema.createTable('picture', function (table) {
        table.increments('id').primary().unique();
        table.string('name').notNullable();
        table.string('createdBy').notNullable();
        table.string('filename').notNullable();
        table.string('filesystem').notNullable();
    });
};

exports.down = async function (knex: Knex) {
    await knex.schema.dropTable('picture');
};
