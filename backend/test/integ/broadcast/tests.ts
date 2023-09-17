import { Client } from './client';
import { ClientScript } from './client_script';
import { delay } from './constants';

type Test = (clientScripts: ClientScript[], filename: string) => Promise<void>;

const test_allClientsReceiveTheirOwnUpdatesInOrder = async (
    clientScripts: ClientScript[],
    filename: string
) => {
    const clients: Client[] = [];
    let clientNum = 0;
    clientScripts.forEach((clientScript) => {
        clients.push(new Client(clientScript, `client_${clientNum}`, filename));
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

const test_allClientsEndWithTheSamePicture_withStaggeredStarts = async (
    clientScripts: ClientScript[],
    filename: string
) => {
    // this one listens, we get actual (expected) from it TODO rename to expectedPictureClient
    const initialPictureClient = new Client(
        {
            initialWait: 0,
            actions: [],
        },
        'initial_client',
        filename
    );
    await initialPictureClient.joinPicture();

    const clients: Client[] = [];
    let clientNum = 0;
    clientScripts.forEach((clientscript) => {
        clients.push(new Client(clientscript, `client_${clientNum}`, filename));
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

export const tests: Test[] = [
    // TODO also need to test that picture is updated on server
    test_allClientsReceiveTheirOwnUpdatesInOrder,
    test_allClientsEndWithTheSamePicture_withStaggeredStarts,
];
