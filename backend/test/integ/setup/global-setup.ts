import { Model } from 'objection';
import {
    makeKnex,
    makeKnexWithoutDatabase,
    testDatabase,
} from '../../../src/db/knex_file';
import { io, server } from '../../../src/app';

// Create the database
async function createTestDatabase() {
    // TODO logging utilities
    const knexWithoutDatabase = makeKnexWithoutDatabase();
    try {
        await knexWithoutDatabase.raw(
            `DROP DATABASE IF EXISTS ${testDatabase}`
        );
        await knexWithoutDatabase.raw(`CREATE DATABASE ${testDatabase}`);
    } catch (error: unknown) {
        throw new Error(
            `issue with createTestDatabase, error is: ${JSON.stringify(error)}`
        );
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
    } catch (error: unknown) {
        throw new Error(
            `issue with seedTestDatabase, error is: ${JSON.stringify(error)}`
        );
    } finally {
        knex.destroy();
    }
}

async function startServer() {
    return new Promise<void>(resolve => {
        io.listen(6543);
        const port = process.env.PORT || 8080;
        // maybe i want to run this in a separate process since node is single threaded
        server.listen(port, () => {
            console.log(`Listening on port ${port}`);
            resolve();
        });
    });
}

module.exports = async () => {
    Model.knex(makeKnex());
    try {
        await createTestDatabase();
        await seedTestDatabase();
        await startServer();
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};
