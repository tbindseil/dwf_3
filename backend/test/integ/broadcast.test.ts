import request from 'supertest';

import { PostPictureInput, PictureDatabaseShape } from 'dwf-3-models-tjb';
import { server, io } from '../../src/app';

import { Client } from './broadcast/client';
import { ClientScript } from './broadcast/client_script';
import { TestSchedule } from './broadcast/test_schedule';
import {
    NUM_PICTURES,
    PICTURE_WIDTH,
    PICTURE_HEIGHT,
    delay,
} from './broadcast/constants';

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
    const testFilenames: string[] = [];
    const testPictures: any[] = [];
    for (let i = 0; i < NUM_PICTURES; ++i) {
        testPictures.push({
            name: `name_${i}`,
            createdBy: `createdBy_${i}`,
            width: PICTURE_WIDTH,
            height: PICTURE_HEIGHT,
        });
    }

    beforeEach(async () => {
        await startServer();

        // create a picture and make sure its there
        for (let i = 0; i < NUM_PICTURES; ++i) {
            const testPicture = testPictures[i];
            const payload: PostPictureInput = {
                name: testPicture.name,
                createdBy: testPicture.createdBy,
                width: testPicture.width,
                height: testPicture.height,
            };

            await request(server)
                .post('/picture')
                .send(payload)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .expect(200);
        }

        // look at all posted pictures
        const { body: pictures } = await request(server)
            .get('/pictures')
            .expect(200);
        expect(pictures.pictures.length).toEqual(NUM_PICTURES);

        pictures.pictures.forEach((p: PictureDatabaseShape) =>
            testFilenames.push(p.filename)
        );
    });

    it.only('runs random test', async () => {
        const randomTestSchedule =
            TestSchedule.makeRandomTestSchedule(testFilenames);
        await runTestSuite(randomTestSchedule);
    });

    // so it seems like it is inconsistently failing with this file
    // and whats weird is that clients will pass even when they have a different number of updates than the initial client
    it('runs tests from file', async () => {
        const testScheduleFilename =
            'savedTestUpdates_Wed__Sep__13__2023__16:53:32__GMT-0600__(Mountain__Daylight__Time)';
        const recoveredTestSchedule = await TestSchedule.fromFile(
            testScheduleFilename,
            testFilenames
        );

        await runTestSuite(recoveredTestSchedule);
    });

    const runTestSuite = async (testSchedule: TestSchedule) => {
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
    };

    const test_allClientsReceiveTheirOwnUpdatesInOrder = async (
        clientScripts: ClientScript[]
    ) => {
        const clients: Client[] = [];
        clientScripts.forEach((clientScript) => {
            clients.push(new Client(clientScript));
        });

        const clientConnectPromsies: Promise<Client>[] = [];
        clients.forEach((c) => clientConnectPromsies.push(c.joinPicture()));
        await Promise.all(clientConnectPromsies);

        const clientWorkPromsies: Promise<void>[] = [];
        clients.forEach((c) => clientWorkPromsies.push(c.start()));
        await Promise.all(clientWorkPromsies);

        // let clients receive all updates
        await delay(1000);

        for (let i = 0; i < clients.length; ++i) {
            await clients[i].close();
        }

        clients.forEach((client) => {
            const sentUpdateIDs = Array.from(
                client.getSentUpdates().values()
            ).map((u) => u.uuid);
            const receivedUpdateIDsFromSelf = Array.from(
                client.getReceivedUpdates().values()
            )
                .filter((u) => sentUpdateIDs.includes(u.uuid))
                .map((u) => u.uuid);

            expect(receivedUpdateIDsFromSelf).toEqual(sentUpdateIDs);
        });
    };

    const test_allClientsEndWithTheSamePicture_withStaggeredStarts = async (
        filename: string,
        clientScripts: ClientScript[]
    ) => {
        // since udpates is empty, it will just give back the picture it receives
        // this one listens, we get actual (expected) from it
        const initialPictureClient = new Client({
            filename,
            clientID: 'initialPictureClient',
            initialWait: 0,
            actions: [],
        });
        await initialPictureClient.joinPicture();

        const clients: Client[] = [];
        clientScripts.forEach((clientscript) => {
            clients.push(new Client(clientscript));
        });

        const clientConnectPromsies: Promise<Client>[] = [];
        const clientWorkPromsies: Promise<void>[] = [];
        clients.forEach((c) => clientConnectPromsies.push(c.joinPicture()));
        clientConnectPromsies.forEach((promise: Promise<Client>) => {
            promise.then((client: Client) => {
                clientWorkPromsies.push(client.start());
            });
        });

        await Promise.all(clientWorkPromsies);

        // let clients receive all updates
        await delay(5000); // TODO wait for initial client to receive sum(updates)

        initialPictureClient.close();
        for (let i = 0; i < clients.length; ++i) {
            await clients[i].close();
        }

        const expectedRaster = initialPictureClient.getRaster();
        for (let i = 0; i < clients.length; ++i) {
            const client = clients[i];
            const actualRaster = client.getRaster();
            expect(actualRaster).toEqual(expectedRaster);
        }
    };

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
