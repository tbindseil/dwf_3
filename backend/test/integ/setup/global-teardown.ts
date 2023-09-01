import {
    makeKnexWithoutDatabase,
    testDatabase,
} from '../../../src/db/knex_file';
import {server} from '../../../src/app';
import { removeAllPng } from './utils';

module.exports = async () => {
    const serverClosed = new Promise<void>(async (resolve) => {
        await removeAllPng();

        try {
            const knexWithoutDatabase = makeKnexWithoutDatabase();
            await knexWithoutDatabase.raw(
                `DROP DATABASE IF EXISTS ${testDatabase}`
            );
            knexWithoutDatabase.destroy();
        } catch (error) {
            console.log(error);
            process.exit(1);
        }

//        server.close((err: unknown) => {
//            console.log('server closing');
//            console.log(`err is: ${err}`);
//            // when i start server in broadcast test
//            // then err is: Server is not running!>@>@>>!?>>>!>>?!?!?!
//            // but, if i start server in global setup,
//            // then err is undefined
//            resolve();
//        });
resolve();
    });

    await serverClosed;
};
