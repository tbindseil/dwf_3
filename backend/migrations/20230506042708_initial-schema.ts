// TODO put any types for knex input and table, can I find those types?

exports.up = async function (knex: any) {
    console.log('@@@@ TJTAG @@@@ migration');
    await knex.schema.createTable('picture', function (table: any) {
        table.increments('id').primary().unique()
        table.string('name').notNullable()
        table.string('createdby').notNullable()
        table.string('filename').notNullable()
        table.string('filesystem').notNullable()
    })
}

exports.down = async function (knex: any) {
    console.log('@@@@ TJTAG @@@@ down migration');
    await knex.schema.dropTable('picture')
}
