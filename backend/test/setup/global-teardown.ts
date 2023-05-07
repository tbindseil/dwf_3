import { knex, knexWithoutDatabase, testDatabase } from '../../src/db/knex_file'

module.exports = async () => {
    try {
        await knex.destroy();
        await knexWithoutDatabase.raw(`DROP DATABASE IF EXISTS ${testDatabase}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    } finally {
        await knexWithoutDatabase.destroy();
    }
}
