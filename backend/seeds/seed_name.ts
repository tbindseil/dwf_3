import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("table_name").del();

    // TODO why seed here and not in the actual integ tests?
    // Inserts seed entries
    await knex("picture").insert([
        { id: 1, name: "name1", createdby: "createdb1", filename: "filenam1", filesystem: "filesyste1" },
        { id: 2, name: "name2", createdby: "createdb2", filename: "filenam2", filesystem: "filesyste2" },
        { id: 3, name: "name3", createdby: "createdb3", filename: "filenam3", filesystem: "filesyste3" },
    ]);
};
