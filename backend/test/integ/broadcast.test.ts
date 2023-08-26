import request from 'supertest';
import * as fs from 'fs';

import { Socket, io as io_package } from 'socket.io-client';

import {
    ClientToServerEvents,
    PixelUpdate,
    PostPictureInput,
    ServerToClientEvents,
} from 'dwf-3-models-tjb';
import { io, server } from '../../src/app';
import { performance } from 'perf_hooks';

const ENDPOINT = 'http://127.0.0.1:6543/';

const PICTURE_WIDTH = 800;
const PICTURE_HEIGHT = 1000;

interface Update {
    waitTimeMS: number;
    pixelUpdate: PixelUpdate;
    sentAt?: number;
}

// TODO this needs to be dried out
io.listen(6543);
const port = process.env.PORT || 8080;
// maybe i want to run this in a separate process since node is single threaded
server.listen(port, () => {
    // TODO wait until server is running
    console.log(`Listening on port ${port}`);
});

describe('TJTAG broadcast test', () => {
    let testFilename: string;
    const testPicture = {
        name: 'name',
        createdBy: 'createdBy',
        width: PICTURE_WIDTH,
        height: PICTURE_HEIGHT,
    };

    beforeEach(async () => {
        // create a picture and make sure its there
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

        // look at all posted pictures
        const { body: pictures } = await request(server)
            .get('/pictures')
            .expect(200);
        expect(pictures.pictures.length).toEqual(1);

        testFilename = pictures.pictures[0].filename;
    });

    it('runs the test', async () => {
        const numClients = 8;
        const numUpdates = [2, 2, 2, 2, 2, 2, 2, 2];
        await testsFromRandom(numClients, numUpdates);
    });

    //    it('runs tests from file', async () => {
    //        await testsFromFile(
    //            'savedTestUpdates_Sat__Aug__26__2023__08:27:50__GMT-0600__(Mountain__Daylight__Time)'
    //        );
    //    });

    const testsFromFile = async (previousUpdatesFilename: string) => {
        const recoveredUpdatesStr = await fs.promises.readFile(
            previousUpdatesFilename
        );
        const recoveredUpdates = JSON.parse('' + recoveredUpdatesStr);
        tests(recoveredUpdates);
    };

    const testsFromRandom = async (
        numClients: number,
        numUpdates: number[]
    ) => {
        let updatesForClients: Update[][] = [];
        for (let i = 0; i < numClients; ++i) {
            updatesForClients.push([]);
            for (let j = 0; j < numUpdates[i]; ++j) {
                updatesForClients[i].push(makeRandomUpdate(i));
            }
        }

        // write first incase we crash
        const createdAt = new Date().toString().replaceAll(' ', '__');
        await fs.promises.writeFile(
            `savedTestUpdates_${createdAt}`,
            JSON.stringify(updatesForClients)
        );

        await tests(updatesForClients);
    };

    // this smells funny
    // and, its causing us to have to have all clients registered
    // before sending any updates
    //
    // we really want to be able to:
    // upon sending an update (and adding an expected update)
    // know which clients are registered
    // and tag the expected udpate with those clients
    // then, we can filter the expectedPixelUpdates more precisely
    //
    // in addition
    //
    // we still need to test the picture sync on join mechanism
    // - should they all end with the same picture? maybe not close right away but stagger when they start
    // - should we track the picture at given time stamps? and find what the picture looks like after the last update but not before the it?
    // - or maybe we think about what is guaranteed. and that is
    // -- that the picture will be received along with any updates that are pending (!!!!)
    // --- that pending updates thing messes things up
    // ---- and by things i mean the regular test that broadcasts are received
    // ----- basically, if a client joins "late", it will get some pending updates, which would not be accounted for in the update -> currently registered client map mentinoed above
    //
    // --- so... we actually need to track the picture
    // ---- and since the real client updates the raster itself, these test clients will have to also
    // --- so, it seems like we need to make sure the client is always ending with the right picture
    // ---- where the right picture is the picture updated with all updates at the time the last udpate is sent
    // ----- maybe I could tag updates with sentAt: performance.now()
    //
    // i still feel confident that its working, at least the broadcast aspect
    // but i guess that is the easy part and the picture sync is difficult
    //
    // one top level entry per client
    // each client has a map of when they received an update and the update received
    // then, all send updates are tracked at a time with who they are from
    // if for each client we filter out the updates they sent, the remaining
    // maps should match
    const receivedPixelUpdates: Map<
        string,
        Map<number, PixelUpdate>
    > = new Map();
    const expectedPixelUpdates = new Map<
        number,
        { pixelUpdate: PixelUpdate; sourceSocketId: string }
    >();

    const tests = async (updatesForClients: Update[][]) => {
        const clients: Promise<Socket>[] = [];
        updatesForClients.forEach((updates) => {
            clients.push(spawnClient(updates));
        });

        const resolvedClients = await Promise.all(clients);

        resolvedClients.forEach((client) => client.close());

        // verify
        receivedPixelUpdates.forEach(
            (
                clientUpdatesReceivedMap: Map<number, PixelUpdate>,
                socketId: string
            ) => {
                const expectedWithoutThisClient = new Map<
                    number,
                    PixelUpdate
                >();
                expectedPixelUpdates.forEach(
                    (
                        value: {
                            pixelUpdate: PixelUpdate;
                            sourceSocketId: string;
                        },
                        timestamp: number
                    ) => {
                        if (value.sourceSocketId !== socketId) {
                            expectedWithoutThisClient.set(
                                timestamp,
                                value.pixelUpdate
                            );
                        }
                    }
                );

                // assert same size
                // sort keys (timestamps) for each
                // assert each map at the sorted key at the index are equal

                expect(clientUpdatesReceivedMap.size).toEqual(
                    expectedWithoutThisClient.size
                );

                const timestampSortFunc = (a: number, b: number) => {
                    if (a < b) {
                        return -1;
                    } else if (a > b) {
                        return 1;
                    } else {
                        return 0;
                    }
                };

                const sortedActualKeys = [
                    ...clientUpdatesReceivedMap.keys(),
                ].sort(timestampSortFunc);
                const sortedExpectedKeys = [
                    ...expectedWithoutThisClient.keys(),
                ].sort(timestampSortFunc);

                for (let i = 0; i < sortedActualKeys.length; ++i) {
                    expect(
                        clientUpdatesReceivedMap.get(sortedActualKeys[i])
                    ).toEqual(
                        expectedWithoutThisClient.get(sortedExpectedKeys[i])
                    );
                }
            }
        );
    };

    // this will expose the issue i saw previously
    // there is a race between a client receiving an update and making their own
    // if a client updates its own raster, then receives an update that was previously received by the server,
    // and the server gets the clients update after
    // then there could be a difference in the resulting raster
    //
    // how to solve this.....
    //
    // lets outline the problem with a sequence diagram
    //
    // server   clientA    clientB
    //   |  joinPic|          |
    //   |<--------|          |
    //   |ack      |          |
    //   |-------->|          |
    //   |         | joinPic  |
    //   |<--------|----------|
    //   |ack      |          |
    //   |---------|--------->|
    //   |         |          |
    //   |         |          |
    //   |  updateA|          |
    //   |<--------|          |
    //   |         |   updateB|
    //   |<--------|----------|
    //   |bUpdateA |          |
    //   |---------|--------->|
    //   |bUpdateB |          |
    //   |---------|--------->|
    //   |         |          |
    //
    //   in the above situation, clientB is sitting with updateB, then updateA
    //   and the server is sitting with updateA, then updateB
    //
    //   that's inconsistent, and the server has it right
    //   i guess the server has to have it right
    //
    // so what does the client do?
    const spawnClient = async (updates: Update[]): Promise<Socket> => {
        return new Promise<Socket>((resolve) => {
            const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
                io_package(ENDPOINT);

            socket.on('server_to_client_update', (pixelUpdate: PixelUpdate) => {
                if (!receivedPixelUpdates.has(socket.id)) {
                    receivedPixelUpdates.set(socket.id, new Map());
                }

                const clientMap = receivedPixelUpdates.get(socket.id);
                if (clientMap) {
                    debug(
                        `setting received update for client ${
                            socket.id
                        } at ${performance.now()}`
                    );
                    clientMap.set(performance.now(), pixelUpdate);
                }
            });

            socket.on('join_picture_response', async () => {
                debug('on join_picture_response');
                // need to forloop to serialize these
                for (let i = 0; i < updates.length; ++i) {
                    const u = updates[i];

                    debug('update');
                    debug(`socketId: ${socket.id}`);
                    debug(`updateNum: ${i}`);
                    debug(`now: ${performance.now()}`);
                    debug(`waiting: ${u.waitTimeMS}ms`);

                    socket.emit('client_to_server_udpate', u.pixelUpdate);

                    u.sentAt = performance.now();
                    debug(
                        `setting expected update for client ${socket.id} at ${u.sentAt}`
                    );
                    expectedPixelUpdates.set(u.sentAt, {
                        pixelUpdate: u.pixelUpdate,
                        sourceSocketId: socket.id,
                    });
                    await delay(u.waitTimeMS);
                }

                // TJTAG once its done sending we need to keep it open
                // then close all after everything is done
                // socket.close();

                resolve(socket);
            });

            socket.on('connect', () => {
                debug(`connected callback and sid is: ${socket.id}`);

                console.log(`spawning client with socketId: ${socket.id}`);

                socket.emit('join_picture_request', { filename: testFilename });
            });
        });
    };

    const makeRandomUpdate = (clientNum: number): Update => {
        const waitTimeMS = randomNumberBetweenZeroAnd(100);
        const pixelUpdate = {
            x: randomNumberBetweenZeroAnd(PICTURE_WIDTH),
            y: randomNumberBetweenZeroAnd(PICTURE_HEIGHT),
            red: randomNumberBetweenZeroAnd(255),
            green: randomNumberBetweenZeroAnd(255),
            blue: randomNumberBetweenZeroAnd(255),
            filename: testFilename,
            createdBy: `client_${clientNum}`,
        };

        return {
            waitTimeMS,
            pixelUpdate,
        };
    };

    const randomNumberBetweenZeroAnd = (high: number): number => {
        return Math.floor(high * Math.random());
    };

    const delay = async (ms: number) => {
        await new Promise((r) => setTimeout(r, ms));
    };

    const debugEnabled = false;
    const debug = (msg: string, force = false) => {
        if (force || debugEnabled) console.log(`TJTAG: ${msg}`);
    };
});
