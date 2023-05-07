import { knex, knexWithoutDatabase, testDatabase } from '../../src/db/knex_file';

// Create the database
async function createTestDatabase() {
    // TODO logging utilities
    console.log('createTestDatabase');
    try {
        await knexWithoutDatabase.raw(`DROP DATABASE IF EXISTS ${testDatabase}`);
        await knexWithoutDatabase.raw(`CREATE DATABASE ${testDatabase}`);
    } catch (error: any) {
        console.log('createTestDatabase throw');
        console.log(`and error is: ${error}`);
        throw new Error(error);
    } finally {
        console.log('createTestDatabase finally');
        await knexWithoutDatabase.destroy();
    }
    console.log('createTestDatabase done');
}

// Seed the database with schema and data
async function seedTestDatabase() {
    console.log('seedTestDatabase');
    try {
        console.log('seedTestDatabase before migrate');
        await knex.migrate.latest();
        console.log('seedTestDatabase after migrate');
        await knex.seed.run();
        console.log('seedTestDatabase after run');
    } catch (error: any) {
        console.log('seedTestDatabase throw');
        throw new Error(error);
    } finally {
        console.log('seedTestDatabase finally');
        await knex.destroy();
    }
    console.log('done seedTestDatabase');
}

module.exports = async () => {
    try {
        await createTestDatabase();
        await seedTestDatabase();
        console.log('Test database created successfully')
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}
