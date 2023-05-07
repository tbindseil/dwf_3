import { knex, knexWithoutDatabase, testDatabase } from '../../src/db/knex_file';

// Create the database
async function createTestDatabase() {
    // TODO logging utilities
    try {
        await knexWithoutDatabase.raw(`DROP DATABASE IF EXISTS ${testDatabase}`);
        await knexWithoutDatabase.raw(`CREATE DATABASE ${testDatabase}`);
    } catch (error: any) {
        throw new Error(error);
    } finally {
        // console.log('@@@@ TJTAG @@@@');
        // console.log('destroying knexWithoutDatabase');
        // await knexWithoutDatabase.destroy();
    }
}

// Seed the database with schema and data
async function seedTestDatabase() {
    try {
        await knex.migrate.latest();
        await knex.seed.run();
    } catch (error: any) {
        throw new Error(error);
    } finally {
        // console.log('@@@@ TJTAG @@@@');
        // console.log('destroying knex');
        // await knex.destroy();
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
