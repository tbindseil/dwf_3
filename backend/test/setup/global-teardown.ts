import { knex_with_database, database } from './'

module.exports = async () => {
  try {
    await knex_with_database.raw(`DROP DATABASE IF EXISTS ${database}`)
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}
