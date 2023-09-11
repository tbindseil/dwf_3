import request from 'supertest';
import * as fs from 'fs';

import { Socket, io as io_package } from 'socket.io-client';

import {
    ClientToServerEvents,
    Update,
    PixelUpdate,
    PostPictureInput,
    ServerToClientEvents,
    JoinPictureResponse,
} from 'dwf-3-models-tjb';
import { server, io } from '../../src/app';
import { performance } from 'perf_hooks';
import { Raster } from 'dwf-3-raster-tjb';

const PICTURE_WIDTH = 800;
const PICTURE_HEIGHT = 1000;

interface UpdateToSend {
    waitTimeMS: number;
    pixelUpdate: PixelUpdate;
    sentAt?: number;
}

const debugEnabled = false;
const debug = (msg: string, force = false) => {
    if (force || debugEnabled) console.log(msg);
};

const delay = async (ms: number) => {
    await new Promise((r) => setTimeout(r, ms));
};

class Client {
    private static readonly ENDPOINT = 'http://127.0.0.1:6543/';

    private readonly socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    private readonly updates: UpdateToSend[];
    private readonly filename: string;
    private readonly expectedUpdates: Map<number, Update>;
    private readonly clientNum: number;
    private readonly receivedUpdates: Map<number, Update> = new Map();

    private raster?: Raster;

    public constructor(
        updates: UpdateToSend[],
        filename: string,
        expectedUpdates: Map<number, Update>,
        clientNum: number
    ) {
        this.socket = io_package(Client.ENDPOINT);
        this.updates = updates;
        console.log(
            `@@@@ TJTAG @@@@ updates.length is: ${this.updates.length}`
        );
        this.filename = filename;
        this.expectedUpdates = expectedUpdates;
        this.clientNum = clientNum;

        this.socket.on('connect', () => {
            debug(`connected callback and sid is: ${this.socket.id}`);
        });

        this.socket.on('server_to_client_update', (update: Update) => {
            debug(
                `receiving update:
                updateID: ${update.uuid}
                now: ${performance.now()}`,
                this.clientNum == 0
            );
            //            debug(
            //                `receiving update:
            //                updateID: ${update.uuid}
            //                ReceivingClientID ${this.socket.id}
            //                now: ${performance.now()}
            //                pixelUpdate: ${JSON.stringify(update)}`,
            //                this.clientNum == 0
            //            );
            this.receivedUpdates.set(performance.now(), update);
            if (this.raster) {
                Update.updateRaster(this.raster, update);
            } else {
                throw Error('receiving update before setting raster');
            }
        });
    }

    public async joinPicture(
        delayBeforeJoining: boolean = false,
        delayMS: number = 0
    ): Promise<Client> {
        if (delayBeforeJoining) {
            await delay(delayMS);
        }

        return new Promise<Client>((resolve) => {
            this.socket.on(
                'join_picture_response',
                async (joinPictureResponse: JoinPictureResponse) => {
                    debug(
                        `received join_picture_response for socketid: ${this.socket.id}`
                    );

                    this.raster = new Raster(
                        joinPictureResponse.width,
                        joinPictureResponse.height,
                        joinPictureResponse.data
                    );

                    resolve(this);
                }
            );
            this.socket.emit('join_picture_request', {
                filename: this.filename,
            });
        });
    }

    public async start(): Promise<void> {
        return new Promise<void>(async (resolve) => {
            // need to forloop to serialize these
            for (let i = 0; i < this.updates.length; ++i) {
                const u = this.updates[i];

                u.sentAt = performance.now();

                debug(
                    `sending update:
                updateID: ${u.pixelUpdate.uuid}
                now: ${u.sentAt}
                waiting: ${u.waitTimeMS}ms`,
                    true
                );

                this.socket.emit('client_to_server_udpate', u.pixelUpdate);

                this.expectedUpdates.set(u.sentAt, u.pixelUpdate);
                await delay(u.waitTimeMS);
            }
            resolve();
        });
    }

    public getReceivedUpdates(): Map<number, Update> {
        return this.receivedUpdates;
    }

    public getRaster(): Raster {
        if (this.raster) {
            return this.raster;
        } else {
            throw Error('raster requested before its received');
        }
    }

    public async close(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.socket.on('leave_picture_response', () => {
                debug(
                    `received leave_picture_response on socekt: ${this.socket.id}`
                );
                this.socket.close();
                resolve();
            });
            this.socket.emit('leave_picture_request', {
                filename: this.filename,
            });
            debug(
                `emitting leave_picture_request on socekt: ${this.socket.id}`
            );
        });
    }

    public static makeRandomUpdate(
        clientNum: number,
        filename: string
    ): UpdateToSend {
        const waitTimeMS = Client.randomNumberBetweenZeroAnd(100);
        const pixelUpdate = new PixelUpdate({
            filename: filename,
            createdBy: `client_${clientNum}`,
            x: Client.randomNumberBetweenZeroAnd(PICTURE_WIDTH),
            y: Client.randomNumberBetweenZeroAnd(PICTURE_HEIGHT),
            red: Client.randomNumberBetweenZeroAnd(255),
            green: Client.randomNumberBetweenZeroAnd(255),
            blue: Client.randomNumberBetweenZeroAnd(255),
        });

        return {
            waitTimeMS,
            pixelUpdate,
        };
    }

    public static randomNumberBetweenZeroAnd(high: number): number {
        return Math.floor(high * Math.random());
    }
}

// start server, this needs to be done in global setup but its being whack
io.listen(6543);
const port = process.env.PORT || 8080;
// maybe i want to run this in a separate process since node is single threaded
server.listen(port, () => {
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

    it('runs random test', async () => {
        const numClients = 20;
        const numUpdates = [
            1, 45, 3, 8, 33, 14, 3, 9, 19, 20, 8, 12, 4, 1, 2, 2, 3, 4, 5, 7,
        ];
        await testsFromRandom(numClients, numUpdates);
    });

    it.only('runs tests from file', async () => {
        await testsFromFile(
            'savedTestUpdates_Sat__Sep__09__2023__12:40:50__GMT-0600__(Mountain__Daylight__Time)'
        );
    });

    const testsFromFile = async (previousUpdatesFilename: string) => {
        const recoveredUpdatesStr = await fs.promises.readFile(
            previousUpdatesFilename
        );
        const recoveredUpdates = JSON.parse('' + recoveredUpdatesStr);

        // filenames need to be replaced becuase of a wrinkle
        // we use the filename in the update to determine where to broadcast
        // it should be pictureID instead of filename
        const recoveredUpdates_replacedFilename: UpdateToSend[][] = [];
        recoveredUpdates.forEach((updates: UpdateToSend[]) => {
            recoveredUpdates_replacedFilename.push(
                updates.map((u: UpdateToSend) => {
                    return {
                        waitTimeMS: u.waitTimeMS,
                        pixelUpdate: {
                            ...u.pixelUpdate,
                            filename: testFilename,
                        },
                    };
                })
            );
        });

        await runTestSuite(recoveredUpdates_replacedFilename);
    };

    const testsFromRandom = async (
        numClients: number,
        numUpdates: number[]
    ) => {
        let updatesForClients: UpdateToSend[][] = [];
        for (let i = 0; i < numClients; ++i) {
            updatesForClients.push([]);
            for (let j = 0; j < numUpdates[i]; ++j) {
                updatesForClients[i].push(
                    Client.makeRandomUpdate(i, testFilename)
                );
            }
        }

        // write first incase we crash
        const createdAt = new Date().toString().replaceAll(' ', '__');
        await fs.promises.writeFile(
            `savedTestUpdates_${createdAt}`,
            JSON.stringify(updatesForClients)
        );

        await runTestSuite(updatesForClients);
    };

    const runTestSuite = async (updatesForClients: UpdateToSend[][]) => {
        console.log('WTF RUN TEST SUITE');
        console.log(`updatesForClients.length is: ${updatesForClients.length}`);
        // also need to test that picture is updated on server
        // also need to test multiple pictures at once
        await test_allClientsReceiveAllUpdatestest(updatesForClients);
        // await test_allClientsEndWithTheSamePicture_withStaggeredStarts( updatesForClients);
        // // also test that picture is saved
        // also test multipl pictures
    };

    const test_allClientsReceiveAllUpdatestest = async (
        updatesForClients: UpdateToSend[][]
    ) => {
        // start all, then
        const expectedUpdates = new Map<number, Update>();

        const clients: Client[] = [];
        let clientNum = 0;
        updatesForClients.forEach((updates) => {
            //            console.log(
            //                `@@@@ TJTAG @@@@ updates is: ${JSON.stringify(updates)}`
            //            );
            clients.push(
                new Client(updates, testFilename, expectedUpdates, clientNum++)
            );
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

        // verify
        // TJTAG looks like with the existing file, the 15th update is always failing
        // and the contents seem consistently different
        console.log(
            `@@@@ TJTAG @@@@ verifying and clients.length is ${clients.length}`
        );
        clients.forEach((client) => {
            const receivedUpdates = client.getReceivedUpdates();

            const receivedValues = Array.from(receivedUpdates.values());
            const expectedValues = Array.from(expectedUpdates.values());

            console.log(
                `@@@@ TJTAG @@@@ receivedValues.length is: ${receivedValues.length} and expectedValues.length is: ${expectedValues.length}`
            );
            for (let i = 0; i < receivedValues.length; ++i) {
                console.log(`@@@@ TJTG @@@@ verifying, i is: ${i}`);
                expect(receivedValues[i]).toEqual(expectedValues[i]);
            }
            //
            //            console.log(
            //                `@@@@ TJTAG @@@@ receivedUpdates.size is: ${receivedUpdates.size}`
            //            );
            //            let numReceivedPrinted = 0;
            //            receivedUpdates.forEach((u) => {
            //                if (numReceivedPrinted++ < 5) {
            //                    console.log(`(received) u is: ${JSON.stringify(u)}`);
            //                }
            //            });
            //            console.log(
            //                `@@@@ TJTAG @@@@ expectedUpdates.size is: ${expectedUpdates.size}`
            //            );
            //            let numExpectedPrinted = 0;
            //            expectedUpdates.forEach((u) => {
            //                if (numExpectedPrinted++ < 5) {
            //                    console.log(`(expected) u is: ${JSON.stringify(u)}`);
            //                }
            //            });
            //            expect(receivedUpdates.values()).toEqual(expectedUpdates.values());
        });
    };

    const test_allClientsEndWithTheSamePicture_withStaggeredStarts = async (
        updatesForClients: UpdateToSend[][]
    ) => {
        const expectedUpdates = new Map<number, Update>();

        // since udpates is empty, it will just give back the picture it receives
        const initialPictureClient = new Client(
            [],
            testFilename,
            expectedUpdates,
            0
        );
        await initialPictureClient.joinPicture();
        const initialRaster = initialPictureClient.getRaster();
        await initialPictureClient.close();

        const clients: Client[] = [];
        updatesForClients.forEach((updates) => {
            clients.push(new Client(updates, testFilename, expectedUpdates, 0));
        });

        const clientConnectPromsies: Promise<Client>[] = [];
        const clientWorkPromsies: Promise<void>[] = [];
        clients.forEach((c) =>
            clientConnectPromsies.push(
                c.joinPicture(true, Client.randomNumberBetweenZeroAnd(500))
            )
        );
        clientConnectPromsies.forEach((promise: Promise<Client>) => {
            promise.then((client: Client) => {
                clientWorkPromsies.push(client.start());
            });
        });

        await Promise.all(clientWorkPromsies);

        // let clients receive all updates
        await delay(1000);

        for (let i = 0; i < clients.length; ++i) {
            await clients[i].close();
        }

        // verify
        expectedUpdates.forEach((u) => Update.updateRaster(initialRaster, u));
        clients.forEach((client: Client) => {
            const actualRaster = client.getRaster();
            expect(actualRaster).toEqual(initialRaster);
        });
    };
});
