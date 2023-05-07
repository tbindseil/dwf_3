import { makeKnex, makeKnexWithoutDatabase, testDatabase } from '../../../src/db/knex_file';

// Create the database
async function createTestDatabase() {
    // TODO logging utilities
    const knexWithoutDatabase = makeKnexWithoutDatabase();
    try {
        await knexWithoutDatabase.raw(`DROP DATABASE IF EXISTS ${testDatabase}`);
        await knexWithoutDatabase.raw(`CREATE DATABASE ${testDatabase}`);
    } catch (error: any) {
        throw new Error(error);
    } finally {
        knexWithoutDatabase.destroy();
    }
}

// Seed the database with schema and data
async function seedTestDatabase() {
    const knex = makeKnex();
    try {
        await knex.migrate.latest();
        await knex.seed.run();
    } catch (error: any) {
        throw new Error(error);
    } finally {
        knex.destroy();
    }
}

module.exports = async () => {
    try {
        await createTestDatabase();
        await seedTestDatabase();
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}
