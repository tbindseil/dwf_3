import { knexWithoutDatabase, testDatabase } from '../../src/db/knex_file'

module.exports = async () => {
    try {
        console.log('before drop database');
        await knexWithoutDatabase.raw(`DROP DATABASE IF EXISTS ${testDatabase}`)
        console.log('after drop database');
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}
