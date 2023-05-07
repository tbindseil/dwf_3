import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("picture").del();

    // Inserts seed entries
    // await knex("picture").insert([
        // these are now inserted by the get_pictures test since its only used there
        // they will likely move back with the get_picture test
        // which means this (or another place) will have to export the test data, probably from test
        // which brings me to my final point, this is test seed so move it to test - TODO
        // { id: 1, name: "name1", createdby: "createdb1", filename: "filenam1", filesystem: "filesyste1" },
        // { id: 2, name: "name2", createdby: "createdb2", filename: "filenam2", filesystem: "filesyste2" },
        // { id: 3, name: "name3", createdby: "createdb3", filename: "filenam3", filesystem: "filesyste3" },
    // ]);
};
