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

describe('TJTAG broadcast test', async () => {
    let testSchedule: TestSchedule;

    beforeAll(async () => {
        await startServer();
        testSchedule = await TestSchedule.makeRandomTestSchedule(NUM_ROUNDS);
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
