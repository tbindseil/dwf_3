import PictureAccessor from '../../picture_accessor/picture_accessor';
import BroadcastMediator from '../../../src/broadcast/broadcast_mediator';
import {
    ClientToServerEvents,
    InterServerEvents,
    PixelUpdate,
    ServerToClientEvents,
    SocketData,
} from 'dwf-3-models-tjb';
import { BroadcastClient } from '../../../src/broadcast/broadcast_client';
import { PictureSyncClient } from '../../../src/broadcast/picture_sync_client';
import { Socket } from 'socket.io';
import { Queue } from '../../broadcast/queue';
import { Raster } from 'dwf-3-raster-tjb';

jest.mock('../../../src/broadcast/broadcast_client');
const mockBroadcastClientClass = jest.mocked(BroadcastClient, true);

jest.mock('../../../src/broadcast/picture_sync_client');
const mockPictureSyncClientClass = jest.mocked(PictureSyncClient, true);

class MockClient {
    public handleUpdate: jest.Mock<any, any> = jest.fn();
    public close: jest.Mock<any, any> = jest.fn();
    public mockClear() {
        this.handleUpdate.mockClear();
        this.close.mockClear();
    }
}

describe('BroadcastMediator Tests', () => {
    const defaultFilename = 'filename';
    const mockSocket = {
        id: 'mockSocketID',
    } as unknown as Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >;
    const mockSocket2 = {
        id: 'mockSocket2',
    } as unknown as Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >;
    const dummyPixelUpdate = {
        name: 'dummyPixelUpdate',
        filename: defaultFilename,
    } as unknown as PixelUpdate;

    const mockGetRaster = jest.fn();
    const mockPictureAccessor = {
        getRaster: mockGetRaster,
    } as unknown as PictureAccessor;

    // this is kinda tricky, we track the vended clients from the mocked BroadcastClient
    // and PictureSyncClient. That way, we can make sure the appropriate ones are being verified
    // now this pattern could probably be encapsulated, and maybe thats what ts mockito does
    // TODO also could be just one map and one func with one caveat being the socketid vs picturesync as key
    const mockBroadcastClients = new Map<string, MockClient>();
    const mockPictureSyncClients = new Map<string, MockClient>();

    const makeMockBroadcastClientInstance = (): MockClient => new MockClient();
    mockBroadcastClientClass.mockImplementation(
        (
            socket: Socket<
                ClientToServerEvents,
                ServerToClientEvents,
                InterServerEvents,
                SocketData
            >
        ) => {
            const mockClient = makeMockBroadcastClientInstance();
            mockBroadcastClients.set(socket.id, mockClient);
            return mockClient as unknown as BroadcastClient;
        }
    );

    const makeMockPictureSyncClientInstance = (): MockClient =>
        new MockClient();
    mockPictureSyncClientClass.mockImplementation(
        (queue: Queue, pictureAccessor: PictureAccessor, raster: Raster) => {
            queue;
            pictureAccessor;
            raster;

            const MockClient = makeMockPictureSyncClientInstance();
            mockPictureSyncClients.set('PICTURE_SYNC_KEY', MockClient);
            return MockClient as unknown as PictureSyncClient;
        }
    );

    let broadcastMediator: BroadcastMediator;

    beforeEach(() => {
        mockBroadcastClients.clear();
        mockPictureSyncClients.clear();

        mockGetRaster.mockClear();
        mockGetRaster.mockReturnValueOnce({
            width: 1,
            height: 1,
            data: [],
        });

        broadcastMediator = new BroadcastMediator(mockPictureAccessor);
    });

    it('throws when pictureAccessor.getRaster throws', async () => {
        const throwAway = mockGetRaster();
        throwAway;
        mockGetRaster.mockRejectedValue(new Error());

        await expect(
            broadcastMediator.addClient('filename', mockSocket)
        ).rejects.toThrow();
    });

    it('adds a PictureSyncClient with the first client for a picture', async () => {
        await broadcastMediator.addClient(defaultFilename, mockSocket);

        const currClients = broadcastMediator.listClients(defaultFilename);
        expect(currClients.length).toEqual(2);
        expect(currClients.includes('PICTURE_SYNC_KEY')).toBeTruthy();
    });

    it('adds the client when addClient is called', async () => {
        await broadcastMediator.addClient(defaultFilename, mockSocket);

        const currClients = broadcastMediator.listClients(defaultFilename);
        expect(currClients.length).toEqual(2);
        expect(currClients.includes(mockSocket.id)).toBeTruthy();
    });

    // it('throws when filename is not present in map', () => {
    it('does not throw when filename is not present in map', () => {
        // defaultFilename hasn't been added yet
        // expect(() => broadcastMediator.removeClient(defaultFilename, mockSocket)).toThrow(new Error(`unable to remove socket id ${mockSocket.id} because client map for filename ${defaultFilename} doesn't exist`));
        broadcastMediator.removeClient(defaultFilename, mockSocket);
    });

    // it('throws when socket id is not present in map', async () => {
    it('does not throw when socket id is not present in map', async () => {
        await broadcastMediator.addClient(defaultFilename, mockSocket);

        const mockSocketNotInMap = {
            id: 'NOT_IN_MAP',
        } as unknown as Socket<
            ClientToServerEvents,
            ServerToClientEvents,
            InterServerEvents,
            SocketData
        >;

        // expect(() => broadcastMediator.removeClient(defaultFilename, mockSocketNotInMap)).toThrow(new Error(`unable to remove socket id ${mockSocketNotInMap.id} because it doesn't exist in client map for filename ${defaultFilename}`));
        broadcastMediator.removeClient(defaultFilename, mockSocketNotInMap);
    });

    it('throws when PictureSyncClient is not the last client', async () => {
        // this is kinda tricky, I explicitly remove pictureSyncClientSocket with remove client
        // I need to add two clients due to the, when one left remove it clause
        await broadcastMediator.addClient(defaultFilename, mockSocket);
        await broadcastMediator.addClient(defaultFilename, mockSocket2);

        const pictureSyncClientSocketFakeout = {
            id: 'PICTURE_SYNC_KEY',
        } as unknown as Socket<
            ClientToServerEvents,
            ServerToClientEvents,
            InterServerEvents,
            SocketData
        >;
        broadcastMediator.removeClient(
            defaultFilename,
            pictureSyncClientSocketFakeout
        );

        expect(() =>
            broadcastMediator.removeClient(defaultFilename, mockSocket)
        ).toThrow(
            new Error(
                `heads up, last client for filename: ${defaultFilename} is not the broadcast client`
            )
        );
    });

    it('removes the client when removeClient is called', async () => {
        await broadcastMediator.addClient(defaultFilename, mockSocket);
        await broadcastMediator.addClient(defaultFilename, mockSocket2);

        const clients = broadcastMediator.listClients(defaultFilename);
        expect(clients.length).toEqual(3);
        expect(clients.includes(mockSocket2.id)).toBeTruthy();

        broadcastMediator.removeClient(defaultFilename, mockSocket2);

        const removedBroadcastClient = mockBroadcastClients.get(mockSocket2.id);

        const afterClients = broadcastMediator.listClients(defaultFilename);
        expect(afterClients.length).toEqual(2);
        expect(afterClients.includes(mockSocket2.id)).toBeFalsy();
        expect(removedBroadcastClient?.close).toBeCalled();
    });

    it('removes the PictureSyncClient when the last client is removed', async () => {
        await broadcastMediator.addClient(defaultFilename, mockSocket);

        const clients = broadcastMediator.listClients(defaultFilename);
        expect(clients.length).toEqual(2);
        expect(clients.includes('PICTURE_SYNC_KEY')).toBeTruthy();

        broadcastMediator.removeClient(defaultFilename, mockSocket);

        const removedBroadcastClient = mockBroadcastClients.get(mockSocket.id);
        const mockPictureSyncClient =
            mockPictureSyncClients.get('PICTURE_SYNC_KEY');

        const afterClients = broadcastMediator.listClients(defaultFilename);
        expect(afterClients.length).toEqual(0);
        expect(afterClients.includes('PICTURE_SYNC_KEY')).toBeFalsy();
        expect(removedBroadcastClient?.close).toBeCalled();
        expect(mockPictureSyncClient?.close).toBeCalled();
    });

    it('sends the update to all registered', async () => {
        await broadcastMediator.addClient(defaultFilename, mockSocket);
        await broadcastMediator.addClient(defaultFilename, mockSocket2);

        broadcastMediator.handleUpdate(dummyPixelUpdate, mockSocket.id);

        // WTF the client is in charge of filtering updates?
        mockBroadcastClients.forEach((mockBroadcastClient: MockClient) => {
            expect(mockBroadcastClient?.handleUpdate).toHaveBeenCalledWith(
                dummyPixelUpdate,
                mockSocket.id
            );
        });

        const mockPictureSyncClient =
            mockPictureSyncClients.get('PICTURE_SYNC_KEY');
        expect(mockPictureSyncClient?.handleUpdate).toHaveBeenCalledWith(
            dummyPixelUpdate,
            mockSocket.id
        );
    });

    it('silently handles missing client map for supplied filename in handleUpdate', () => {
        broadcastMediator.handleUpdate(dummyPixelUpdate, mockSocket.id);
    });

    it('lists all clients given a filename', async () => {
        await broadcastMediator.addClient(defaultFilename, mockSocket);

        const ret = broadcastMediator.listClients(defaultFilename);
        expect(ret.length).toEqual(2);
    });

    it('returns an empty list when listing clients for a nonexistent filename', () => {
        const ret = broadcastMediator.listClients(defaultFilename);
        expect(ret.length).toEqual(0);
    });

    // TODO test that clients are closed after removal
});
