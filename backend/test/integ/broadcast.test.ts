import { server, io } from '../../src/app';
import { TestSchedule } from './broadcast/test_schedule';
import { NUM_ROUNDS } from './broadcast/constants';

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

describe('TJTAG broadcast test', () => {
    let testSchedule: TestSchedule;

    beforeAll(async () => {
        await startServer();
        testSchedule = await TestSchedule.makeRandomTestSchedule(NUM_ROUNDS);
        //        testSchedule = await TestSchedule.fromFile(
        //            'savedTestSchedule_Sun__Sep__17__2023__10:32:29__GMT-0600__(Mountain__Daylight__Time)'
        //        );
    });

    it('runs the tests simultaneously intentionally', async () => {
        await testSchedule.runTests();
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
