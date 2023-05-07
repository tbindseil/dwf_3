/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('picture').del()
    await knex('picture').insert([
        { id: 1, name: "name1", createdby: "createdb1", filename: "filenam1", filesystem: "filesyste1" },
        { id: 2, name: "name2", createdby: "createdb2", filename: "filenam2", filesystem: "filesyste2" },
        { id: 3, name: "name3", createdby: "createdb3", filename: "filenam3", filesystem: "filesyste3" },
    ]);
};


