import { Knex } from 'knex';

exports.up = async function (knex: Knex) {
    await knex.raw(
        'alter table picture rename column createdby to created_by;'
    );
};

exports.down = async function (knex: Knex) {
    await knex.raw(
        'alter table picture rename column created_by to createdby;'
    );
};
