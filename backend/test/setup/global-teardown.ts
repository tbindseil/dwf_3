import { makeKnexWithoutDatabase, testDatabase } from '../../src/db/knex_file'

module.exports = async () => {
    try {
        // spin 30 sec
//         console.log('before destroy waiting 30 sec');
//         await new Promise(resolve => setTimeout(resolve, 30000)); // 30 sec
//         console.log('before destroy done waiting 30 sec');

        // should already be destroyed...
        // await knex.destroy();

        // spin 30 sec
        const waitTime = 30;
//         console.log(`waiting ${waitTime} sec`);
//         await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
//         console.log(`done waiting ${waitTime} sec`);

        const knexWithoutDatabase = makeKnexWithoutDatabase();
        await knexWithoutDatabase.raw(`DROP DATABASE IF EXISTS ${testDatabase}`);
        knexWithoutDatabase.destroy();
    } catch (error) {
        console.log(error);
        process.exit(1);
    // } finally {
        // await knexWithoutDatabase.destroy();
    }
}
