import request from 'supertest';
import * as fs from 'fs';

import { Socket, io as io_package } from 'socket.io-client';

import {
    ClientToServerEvents,
    Update,
    PixelUpdate,
    PostPictureInput,
    ServerToClientEvents,
} from 'dwf-3-models-tjb';
import { server } from '../../src/app';
import { performance } from 'perf_hooks';

const PICTURE_WIDTH = 800;
const PICTURE_HEIGHT = 1000;

interface UpdateToSend {
    waitTimeMS: number;
    pixelUpdate: PixelUpdate;
    sentAt?: number;
}

const debugEnabled = true;
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
    private readonly receivedUpdates: Map<number, Update> = new Map();

    public constructor(
        updates: UpdateToSend[],
        filename: string,
        expectedUpdates: Map<number, Update>
    ) {
        this.socket = io_package(Client.ENDPOINT);
        this.updates = updates;
        this.filename = filename;
        this.expectedUpdates = expectedUpdates;

        this.socket.on('connect', () => {
            debug(`connected callback and sid is: ${this.socket.id}`);
        });

        this.socket.on('server_to_client_update', (update: Update) => {
            debug(
                `setting received update for client ${
                    this.socket.id
                } at ${performance.now()}`
            );
            this.receivedUpdates.set(performance.now(), update);
        });
    }

    public async joinPicture(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.socket.on('join_picture_response', async () => {
                debug(
                    `received join_picture_response for socketid: ${this.socket.id}`
                );
                resolve();
            });
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

                debug(`printing update:
                socketId: ${this.socket.id}
                updateNum: ${i}
                now: ${performance.now()}
                waiting: ${u.waitTimeMS}ms
                done printing update`);

                this.socket.emit('client_to_server_udpate', u.pixelUpdate);

                u.sentAt = performance.now();
                debug(
                    `setting expected update for client ${this.socket.id} at ${u.sentAt}`
                );
                this.expectedUpdates.set(u.sentAt, u.pixelUpdate);
                await delay(u.waitTimeMS);
            }
            resolve();
        });
    }

    public getReceivedUpdates(): Map<number, Update> {
        return this.receivedUpdates;
    }

    public async close(): Promise<void> {
        return new Promise<void>(resolve => {
            this.socket.on('leave_picture_response', () => {
                debug(`received leave_picture_response on socekt: ${this.socket.id}`);
                this.socket.close();
                resolve();
            });
            this.socket.emit('leave_picture_request', { filename: this.filename });
            debug(`emitting leave_picture_request on socekt: ${this.socket.id}`);
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
        const numClients = 2;
        const numUpdates = [2, 2]; // , 2, 2, 2, 2, 2, 2];
        await testsFromRandom(numClients, numUpdates);
    });

    //    it('runs tests from file', async () => {
    //        await testsFromFile(
    //            'savedTestUpdates_Sat__Aug__26__2023__08:27:50__GMT-0600__(Mountain__Daylight__Time)'
    //        );
    //    });

    //    const testsFromFile = async (previousUpdatesFilename: string) => {
    //        const recoveredUpdatesStr = await fs.promises.readFile(
    //            previousUpdatesFilename
    //        );
    //        const recoveredUpdates = JSON.parse('' + recoveredUpdatesStr);
    //        tests(recoveredUpdates);
    //    };

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

        await test_allClientsReceiveAllUpdatestest(updatesForClients);
    };

    const test_allClientsEndWithTheSamePicture_withStaggeredStarts = () => {
        const lol = 4;
    };
    // also need to test that picture is updated on server
    // also need to test multiple pictures at once

    const test_allClientsReceiveAllUpdatestest = async (updatesForClients: UpdateToSend[][]) => {
        const expectedUpdates = new Map<number, Update>();

        const clients: Client[] = [];
        updatesForClients.forEach((updates) => {
            clients.push(new Client(updates, testFilename, expectedUpdates));
        });

        const clientConnectPromsies: Promise<void>[] = [];
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
        clients.forEach((client) => {
            const receivedUpdates = client.getReceivedUpdates();
            expect(receivedUpdates.values()).toEqual(expectedUpdates.values());
        });

        console.log('TJTAG done with verification');
    };
});
