import {
    makeKnexWithoutDatabase,
    testDatabase,
} from '../../../src/db/knex_file'

module.exports = async () => {
    try {
        const knexWithoutDatabase = makeKnexWithoutDatabase()
        await knexWithoutDatabase.raw(`DROP DATABASE IF EXISTS ${testDatabase}`)
        knexWithoutDatabase.destroy()
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}
