import { Client } from './client';
import { ClientScript } from './client_script';
import { delay } from './misc';

// might need to be async eventually
type Verification = (clients: Client[], expectedClient: Client) => void;

export class Test {
    private readonly expectedClient: Client;
    public constructor(
        private readonly clientScripts: ClientScript[],
        private readonly filename: string,
        private readonly verifications: Verification[]
    ) {
        this.expectedClient = new Client(
            {
                initialWait: 0,
                actions: [],
            },
            'expected_client',
            filename
        );
        this.expectedClient.joinPicture();
    }

    public async run(): Promise<void> {
        const clients = this.clientScripts.map(
            (clientScript, index) =>
                new Client(clientScript, `client_${index}`, this.filename)
        );

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

        for (let i = 0; i < clients.length; ++i) {
            await clients[i].close();
        }
        this.expectedClient.close();

        this.verifications.forEach((v) => v(clients, this.expectedClient));
    }

    // I guess what i'm getting at is
    // if i do this right, each picture can be mapped to a single
    // list of client scripts. Those are executed for the picture,
    // and then all tests are performed. So Tests are really verifications
    // and the test is just below
    // private async runClientScripts(clients: Client[]): Promise<Client[]> {
}

const verifyAllClientsReceiveTheirOwnUpdatesInOrder = (
    clients: Client[],
    _expectedClient: Client
) => {
    clients.forEach((client) => {
        const sentUpdateIDs = Array.from(client.getSentUpdates().values()).map(
            (u) => u.uuid
        );
        const receivedUpdateIDsFromSelf = Array.from(
            client.getReceivedUpdates().values()
        )
            .filter((u) => sentUpdateIDs.includes(u.uuid))
            .map((u) => u.uuid);

        expect(receivedUpdateIDsFromSelf).toEqual(sentUpdateIDs);
    });
};

const verifyAllClientsEndWithTheSamePicture = (
    clients: Client[],
    expectedClient: Client
) => {
    const expectedRaster = expectedClient.getRaster();
    for (let i = 0; i < clients.length; ++i) {
        const client = clients[i];
        const actualRaster = client.getRaster();
        expect(actualRaster).toEqual(expectedRaster);
    }
};

const verifyServerEndsUpWithCorrectPictureSaved = (
    _clients: Client[],
    expectedClient: Client
) => {
    const expectedRaster = expectedClient.getRaster();
    // TODO - rejoin, and get raster, after sufficient time, it should be expectedRaster
};

export const verifications: Verification[] = [
    verifyAllClientsReceiveTheirOwnUpdatesInOrder,
    verifyAllClientsEndWithTheSamePicture,
    verifyServerEndsUpWithCorrectPictureSaved,
];
