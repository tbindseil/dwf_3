import { server, io } from '../../src/app';

import { Client } from './broadcast/client';
import { ClientScript } from './broadcast/client_script';
import { TestSchedule } from './broadcast/test_schedule';
import { NUM_PICTURES, delay } from './broadcast/constants';

// start server, this needs to be done in global setup but its being whack
const startServer = async () => {
    return new Promise<void>((resolve) => {
        io.listen(6543);
        const port = process.env.PORT || 8080;
        // maybe i want to run this in a separate process since node is single threaded
        server.listen(port, () => {
            console.log(`Listening on port ${port}`);
            resolve();
        });
    });
};

describe('TJTAG broadcast test', async () => {
    // TODO is this really the best way?
    let testSchedule: TestSchedule;

    beforeAll(async () => {
        await startServer();
        const randomTestSchedule = await TestSchedule.makeRandomTestSchedule(
            NUM_PICTURES
        ); // TODO take in number of files

        //        const testScheduleFilename =
        //            'savedTestUpdates_Wed__Sep__13__2023__16:53:32__GMT-0600__(Mountain__Daylight__Time)';
        //        const recoveredTestSchedule = await TestSchedule.fromFile(
        //            testScheduleFilename,
        //            testFilenames
        //        );
        testSchedule = randomTestSchedule;
    });

    it('runs the tests simultaneously intentionally', async () => {
        // also need to test that picture is updated on server
        // also need to test multipl pictures - happening now
        const tests: Promise<void>[] = [];
        testFilenames.forEach((filename) => {
            const clientScripts = testSchedule.getClientScripts(filename);

            // TODO only one of these will pass if client num is 1, for obvious reasons (same picture)
            // so really, the test schedule should determine the initial picture creation

            tests.push(
                test_allClientsReceiveTheirOwnUpdatesInOrder(clientScripts)
            );
            //tests.push(
            //    test_allClientsEndWithTheSamePicture_withStaggeredStarts(
            //        filename,
            //        clientScripts
            //    )
            //);
        });

        await Promise.all(tests);
    });

    afterAll(async () => {
        const p = new Promise<void>((resolve) => {
            server.close((err: unknown) => {
                console.log('server closing');
                if (err) console.log(`err is: ${err}`);
                resolve();
            });
        });

        await p;
    });
});
