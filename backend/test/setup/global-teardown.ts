import { knex, knexWithoutDatabase, testDatabase } from '../../src/db/knex_file'

module.exports = async () => {
    try {
        await knexWithoutDatabase.raw(`DROP DATABASE IF EXISTS ${testDatabase}`)
    } catch (error) {
        console.log(error)
    } finally {
        knexWithoutDatabase.destroy();
        knex.destroy();
    }
}
