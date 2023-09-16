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
    PictureDatabaseShape,
} from 'dwf-3-models-tjb';
import { server, io } from '../../src/app';
import { performance } from 'perf_hooks';
import { Raster } from 'dwf-3-raster-tjb';

const NUM_PICTURES = 1; // 3;
const MAX_CLIENTS_PER_PICTURE = 20;
const MAX_CLIENT_ACTIONS = 20;
const MAX_WAIT_MS = 500;
const PICTURE_WIDTH = 80;
const PICTURE_HEIGHT = 100;

interface Action {
    waitTimeMS: number; // TODO preWaitMS
    pixelUpdate: PixelUpdate;
    sentAt?: number;
}

interface ClientScript {
    initialWait: number;
    actions: Action[];
}

class TestSchedule {
    private readonly pictures: Map<string, ClientScript[]>; // TODO rename

    private constructor(pictures: Map<string, ClientScript[]>) {
        this.pictures = pictures;
    }

    public getClientScripts(filename: string): ClientScript[] {
        const clientScripts = this.pictures.get(filename);
        if (!clientScripts) {
            throw Error(`no scripts for filename: ${filename}`);
        }
        return clientScripts;
    }

    public async toFile() {
        // well what's interesting is that the filename isn't consistent accross runs
        // so we just need to keep the ClientScripts grouped together
        // so we could probably just group them into an array of arrays
        const scriptsSansFilenames: ClientScript[][] = [];
        Array.from(this.pictures.values()).forEach((scripts) =>
            scriptsSansFilenames.push(scripts)
        );
        const createdAt = new Date().toString().replaceAll(' ', '__');
        await fs.promises.writeFile(
            `savedTestSchedule_${createdAt}`,
            JSON.stringify(scriptsSansFilenames)
        );
    }

    public static async fromFile(
        testScheduleFile: string,
        pictureFilenames: string[]
    ): Promise<TestSchedule> {
        const scriptsSansFilenames: ClientScript[][] = JSON.parse(
            '' + (await fs.promises.readFile(testScheduleFile))
        );

        // TODO NUM_PICTURES is kinda tied in here
        if (scriptsSansFilenames.length !== pictureFilenames.length) {
            throw Error(
                `recovered ${scriptsSansFilenames.length} sets of updates but expected ${pictureFilenames.length}`
            );
        }

        const pictureToScripts = new Map<string, ClientScript[]>();
        for (let i = 0; i < scriptsSansFilenames.length; ++i) {
            pictureToScripts.set(pictureFilenames[i], scriptsSansFilenames[i]);
        }

        // updates have the picture they are applied to as part of their model
        // TODO probably a code smell here, make sure there is a note to address
        pictureToScripts.forEach(
            (scripts: ClientScript[], filename: string) => {
                scripts.forEach((script) => {
                    script.actions.map((a) => {
                        return {
                            waitTimeMS: a.waitTimeMS,
                            pixelUpdate: {
                                ...a.pixelUpdate,
                                filename: filename,
                            },
                        };
                    });
                });
            }
        );

        return new TestSchedule(pictureToScripts);
    }

    public static makeRandomTestSchedule(filenames: string[]): TestSchedule {
        const pictureToScripts = new Map<string, ClientScript[]>();

        filenames.forEach((filename) => {
            const clientsInThisPicture = Client.randomNumberBetweenZeroAnd(
                MAX_CLIENTS_PER_PICTURE
            );

            const clientScripts: ClientScript[] = [];
            for (let j = 0; j < clientsInThisPicture; ++j) {
                clientScripts.push(
                    this.makeRandomClientScript(
                        filename,
                        `${j}`, // TODO this is kind of a weird place to declare client id, it seems like client id should come in here somehow
                        Client.randomNumberBetweenZeroAnd(MAX_CLIENT_ACTIONS)
                    )
                );
            }

            pictureToScripts.set(filename, clientScripts);
        });

        const randomTestSchedule = new TestSchedule(pictureToScripts);
        randomTestSchedule.toFile();
        return randomTestSchedule;
    }

    private static makeRandomClientScript(
        filename: string,
        clientID: string,
        numActions: number
    ): ClientScript {
        const initialWait = Client.randomNumberBetweenZeroAnd(MAX_WAIT_MS); // TODO I don't think this should be in the Client class
        const actions: Action[] = [];
        for (let i = 0; i < numActions; ++i) {
            actions.push(Client.makeRandomUpdate(clientID, filename));
        }

        return {
            initialWait,
            actions,
        };
    }
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
    private readonly script: ClientScript;
    private readonly filename: string;
    public readonly clientNum: number; // TODO clientID?
    private readonly receivedUpdates: Map<number, Update> = new Map();
    private readonly sentUpdates: Map<number, Update> = new Map();

    private raster?: Raster;

    public constructor(
        script: ClientScript,
        filename: string,
        clientNum: number
    ) {
        this.socket = io_package(Client.ENDPOINT);
        this.script = script;
        this.filename = filename; // TODO should this be in the interface?
        this.clientNum = clientNum;

        this.socket.on('connect', () => {
            debug(`connected callback and sid is: ${this.socket.id}`);
        });

        this.socket.on('server_to_client_update', (update: Update) => {
            debug(`receiving update: ${update.uuid} @ ${performance.now()}`);

            this.receivedUpdates.set(performance.now(), update);
            if (this.raster) {
                Update.updateRaster(this.raster, update);
            } else {
                throw Error('receiving update before setting raster');
            }
        });
    }

    public async joinPicture(): Promise<Client> {
        if (this.script.initialWait) {
            await delay(this.script.initialWait);
            debug(
                `clientNum_${this.clientNum} done waiting ${this.script.initialWait}ms`
            );
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
            for (let i = 0; i < this.script.actions.length; ++i) {
                const currAction = this.script.actions[i];

                currAction.sentAt = performance.now();

                debug(
                    `sending update: ${currAction.pixelUpdate.uuid} @ ${currAction.sentAt} then waiting ${currAction.waitTimeMS}ms`
                );

                this.socket.emit(
                    'client_to_server_udpate',
                    currAction.pixelUpdate
                );
                this.sentUpdates.set(currAction.sentAt, currAction.pixelUpdate);

                await delay(currAction.waitTimeMS);
            }
            resolve();
        });
    }

    public getReceivedUpdates(): Map<number, Update> {
        return this.receivedUpdates;
    }

    public getSentUpdates(): Map<number, Update> {
        return this.sentUpdates;
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

    public makeUpdatesFileString(): string {
        let ret = `printing picture update ids for client_${this.clientNum}`;
        this.getReceivedUpdates().forEach((u) => (ret += `\n    ${u.uuid}`));
        return ret;
    }

    public static makeRandomUpdate(
        clientNum: string,
        filename: string
    ): Action {
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
            tests.push(
                test_allClientsReceiveTheirOwnUpdatesInOrder(
                    filename,
                    clientScripts
                )
            );
            tests.push(
                test_allClientsEndWithTheSamePicture_withStaggeredStarts(
                    filename,
                    clientScripts
                )
            );
        });

        await Promise.all(tests);
    };

    const test_allClientsReceiveTheirOwnUpdatesInOrder = async (
        filename: string,
        clientScripts: ClientScript[]
    ) => {
        const clients: Client[] = [];
        let clientNum = 0;
        clientScripts.forEach((clientscript) => {
            clients.push(new Client(clientscript, filename, clientNum++)); // TODO instead of clientNum, save clientID in client script and pass it in
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
        const initialPictureClient = new Client(
            { initialWait: 0, actions: [] },
            filename,
            0
        );
        await initialPictureClient.joinPicture();

        const clients: Client[] = [];
        let clientNum = 0;
        clientScripts.forEach((clientscript) => {
            clients.push(new Client(clientscript, filename, clientNum++));
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
