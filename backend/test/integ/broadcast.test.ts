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

    const testsFromFile = async (previousUpdatesFilename: string) => {
        // unverified
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
        await tests(updatesForClients);
    };

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
        // write first incase we crash
        // unverified
        const createdAt = new Date().toString().replaceAll(' ', '__');
        await fs.promises.writeFile(
            `savedTestUpdates_${createdAt}`,
            JSON.stringify(updatesForClients)
        );

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

                    //                    debug('update');
                    //                    debug(`socketId: ${socket.id}`);
                    //                    debug(`updateNum: ${i}`);
                    //                    debug(`now: ${performance.now()}`);
                    //                    debug(`waiting: ${u.waitTimeMS}ms`);

                    socket.emit('client_to_server_udpate', u.pixelUpdate);

                    debug(
                        `setting expected update for client ${
                            socket.id
                        } at ${performance.now()}`
                    );
                    expectedPixelUpdates.set(performance.now(), {
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

    const debugEnabled = true;
    const debug = (msg: string, force = false) => {
        if (force || debugEnabled) console.log(`TJTAG: ${msg}`);
    };
});
