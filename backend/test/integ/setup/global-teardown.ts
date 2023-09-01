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

        server.close(() => {
            console.log('server closing');
            resolve();
        });
    });

    await serverClosed;
};

//module.exports = async () => {
//    await removeAllPng();
//
//    try {
//        const knexWithoutDatabase = makeKnexWithoutDatabase();
//        await knexWithoutDatabase.raw(
//            `DROP DATABASE IF EXISTS ${testDatabase}`
//        );
//        console.log('TJTAG - about to destroy db');
//        knexWithoutDatabase.destroy();
//        console.log('TJTAG - done destroy db');
//    } catch (error) {
//        console.log(error);
//        process.exit(1);
//    }
//};
