// TODO put any types for knex input and table, can I find those types?

// TODO knex: any , this is typescript, compile to js, and point the knex file to the compiled
exports.up = async function (knex) {
    console.log('@@@@ TJTAG @@@@ migration');
    await knex.schema.createTable('picture', function (table) {
        table.increments('id').primary().unique()
        table.string('name').notNullable()
        table.string('createdby').notNullable()
        table.string('filename').notNullable()
        table.string('filesystem').notNullable()
    })
}

exports.down = async function (knex) {
    console.log('@@@@ TJTAG @@@@ down migration');
    await knex.schema.dropTable('picture')
}
