import { knex, database } from './'

// Create the database
async function createTestDatabase() {
    try {
        await knex.raw(`DROP DATABASE IF EXISTS ${database}`);
        await knex.raw(`CREATE DATABASE ${database}`);
    } catch (error: any) {
        throw new Error(error);
    } finally {
        await knex.destroy();
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
        await knex.destroy();
    }
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


// TJTAG, time to write the actual integ tests and see how rough this is
