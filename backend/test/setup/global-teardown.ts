import { knex, testDatabase } from '../../src/db/knex_file'

module.exports = async () => {
  try {
    await knex.raw(`DROP DATABASE IF EXISTS ${testDatabase}`)
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}
