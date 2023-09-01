import {
    makeKnexWithoutDatabase,
    testDatabase,
} from '../../../src/db/knex_file';
import {server} from '../../../src/app';
import { removeAllPng } from './utils';

module.exports = async () => {
    const serverClosed = new Promise<void>(async (resolve) => {
        console.log('TJTAG removing png');
        await removeAllPng();
        console.log('TJTAG done removing png');

        console.log('TJTAG destroying database');
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
        console.log('TJTAG done destroying database');

        server.close(() => {
            console.log('TJTAG server close callback');
            resolve();
        });
    });

    console.log('TJTAG awaiting serverClosed promise');
    await serverClosed;
    console.log('TJTAG done awaiting serverClosed promise');
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
