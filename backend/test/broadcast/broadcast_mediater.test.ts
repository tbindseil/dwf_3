import PictureAccessor from "../picture_accessor/picture_accessor";
import BroadcastMediator from "../../src/broadcast/broadcast_mediator";
import {ClientToServerEvents, InterServerEvents, PixelUpdate, ServerToClientEvents, SocketData} from "dwf-3-models-tjb";
import {Socket} from "socket.io";
import BroadcastClientFactory from "./broadcast_client";
import PictureSyncClientFactory from "./picture_sync_client";

function getMockKey(methodName: string): string {
    return `mock_${methodName}`;
}

const autoConvertMapToObject = (map: Map<string, jest.Mock<any, any>>) => {
    const obj: any = {};
    for (const item of [...map]) {
        const [
            key,
            value
        ] = item;
        console.log(`autoConvertMapToObject: key is: ${key} and value is: ${value}`);
        obj[key] = value;
    }

    console.log(`autoConvertMapToObject: obj is: ${JSON.stringify(obj)}`);
    console.log(`autoConvertMapToObject: obj.getRaster is: ${JSON.stringify(obj)}`);

    return obj;
}

// utility and example
function getSingleFunctionMock<T>(toMock: any): [jest.Mock<any, any>, T] {
    if (Object.keys(toMock).length !== 1) {
        throw new Error(`getSingleFunctionMock must have toMock with only one key, Object.keys(toMock) is: ${Object.keys(toMock)}`);
    }
    const key = Object.keys(toMock)[0];

    const [funcs, mocked] = mockObject<T>(toMock);
    console.log(`getSingleFunctionMock: mocked is: ${JSON.stringify(mocked)}`);
    const singleFunction = funcs.get(getMockKey(key));
    if (!singleFunction) {
        throw new Error('getSingleFunctionMock failure, singleFunction is unknown');
    }

    return [singleFunction, mocked];
}

function mockObject<T>(toMock: any): [Map<string, jest.Mock<any, any>>, T] {
    const funcs = new Map<string, jest.Mock<any, any>>();

    const keys = Object.keys(toMock);
    console.log(`mockObject: keys: ${keys}`);

    const m = new Map<string, jest.Mock<any, any>>();

    keys.forEach((k: string) => {
        console.log(`mockObject: keys forEach`);
        const mockKey = getMockKey(k);
        const mockFunc = jest.fn();
        funcs.set(mockKey, mockFunc);
        console.log(`mockKey is: ${mockKey} and typeof mockKey is: ${typeof mockKey}`);
        console.log(`mockFunc is: ${mockFunc} and typeof mockFunc is: ${typeof mockFunc}`);
        m.set(mockKey, mockFunc);
//         Object.assign(mocked, { mockKey, mockFunc }); // sets mockKey: mock_getRaster
//         mocked[mockKey] = mockFunc; // results in an object indexible by mockKey to give function, but htats not how its used in source code
//         mocked = {
//             ...mocked,
//             mockKey: mockFunc
//         };
//         toMock = {
//             ...toMock,
//             mockKey: funcs.get(mockKey)
//         };
//
//     const mockGetRaster = jest.fn();
//     const mockPictureAccessor = {
//         getRaster: mockGetRaster
//     } as unknown as PictureAccessor;
//
    });

    //m.keys().forEach(k => console.log(`m[${k}] is: ${m[k]}`));

    console.log(`m.len is ${m.size}`);
    //m.entries()k
    for (let entry of m.entries()) {
        console.log('actually before');
        const [key, value] = entry;
        console.log(`key: ${key} and value: ${value}`);
    }

    for (const entry in m.entries()) {
        console.log('before assignment');
        const [key, value] = entry;
        console.log(`key: ${key} and value: ${value}`);
    }

    const mocked = autoConvertMapToObject(m);
    console.log(`mockObject: mocked: ${JSON.stringify(mocked)}`);

    return [funcs, mocked as T];
}

describe('BroadcastMediator Tests', () => {
    const defaultFilename = 'filename';
    const mockSocket = {
        id: 'mockSocketID'
    } as unknown as Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

    const [mockGetRaster, mockPictureAccessor] = getSingleFunctionMock<PictureAccessor>({
        getRaster: 'none'
    });
//     const mockGetRaster = jest.fn();
//     const mockPictureAccessor = {
//         getRaster: mockGetRaster
//     } as unknown as PictureAccessor;

    const mockCreateBroadcastClient = jest.fn();
    const mockBroadcastClientFactory = {
        createBroadcastClient: mockCreateBroadcastClient
    } as unknown as BroadcastClientFactory;

    const mockCreatePictureSyncClient = jest.fn();
    const mockPictureSyncClientFactory = {
        createPictureSyncClient: mockCreatePictureSyncClient
    } as unknown as PictureSyncClientFactory;

    const mockPictureSyncHandleUpdate = jest.fn();
    const mockPictureSyncClient = {
        name: 'mockPictureSyncClient',
        handleUpdate: mockPictureSyncHandleUpdate
    };
    mockCreatePictureSyncClient.mockReturnValue(mockPictureSyncClient);
    const mockBroadcastHandleUpdate = jest.fn();
    const mockBroadcastClient = {
        name: 'mockBroadcastClient',
        handleUpdate: mockBroadcastHandleUpdate
    };
    mockCreateBroadcastClient.mockReturnValue(mockBroadcastClient);

    let broadcastMediator: BroadcastMediator;

    beforeEach(() => {
        mockGetRaster.mockClear();
        mockCreatePictureSyncClient.mockClear();
        mockCreateBroadcastClient.mockClear();

        broadcastMediator = new BroadcastMediator(mockPictureAccessor, mockBroadcastClientFactory, mockPictureSyncClientFactory);
    });

    it('throws when pictureAccessor.getRaster throws', async () => {
        mockGetRaster.mockRejectedValue(new Error());

        await expect(broadcastMediator.addClient('filename', mockSocket)).rejects.toThrow();
    });

    it.only('adds a PictureSyncClient with the first client for a picture', async () => {
        mockGetRaster.mockReturnValueOnce({
            width: 1,
            height: 1,
            data: []
        });

        await broadcastMediator.addClient(defaultFilename, mockSocket);

        const currClients = broadcastMediator.listClients(defaultFilename);
        expect(currClients.length).toEqual(2);
        expect(currClients.includes('PICTURE_SYNC_KEY')).toBeTruthy();
    });

    it('adds the client when addClient is called', async () => {
        mockGetRaster.mockReturnValueOnce({
            width: 1,
            height: 1,
            data: []
        });

        await broadcastMediator.addClient(defaultFilename, mockSocket);

        const currClients = broadcastMediator.listClients(defaultFilename);
        expect(currClients.length).toEqual(2);
        expect(currClients.includes(mockSocket.id)).toBeTruthy();
    });

    it('throws when filename is not present in map', () => {
        // defaultFilename hasn't been added yet
        expect(() => broadcastMediator.removeClient(defaultFilename, mockSocket)).toThrow(new Error(`unable to remove socket id ${mockSocket.id} because client map for filename ${defaultFilename} doesn't exist`));
    });

    it('throws when socket id is not present in map', async () => {
        mockGetRaster.mockReturnValueOnce({
            width: 1,
            height: 1,
            data: []
        });

        await broadcastMediator.addClient(defaultFilename, mockSocket);

        const mockSocketNotInMap = {
            id: 'NOT_IN_MAP'
        } as unknown as Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

        expect(() => broadcastMediator.removeClient(defaultFilename, mockSocketNotInMap)).toThrow(new Error(`unable to remove socket id ${mockSocketNotInMap.id} because it doesn't exist in client map for filename ${defaultFilename}`));
    });

    it('throws when PictureSyncClient is not the last client', async () => {
        // this is kinda tricky, I explicitly remove it with remove client
        mockGetRaster.mockReturnValue({
            width: 1,
            height: 1,
            data: []
        });

        // I need to add two clients due to the, when one left remove it clause
        await broadcastMediator.addClient(defaultFilename, mockSocket);
        const mockSocket2 = {
            id: 'mockSocket2'
        } as unknown as Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
        await broadcastMediator.addClient(defaultFilename, mockSocket2);

        const pictureSyncClientSocketFakeout = {
            id: 'PICTURE_SYNC_KEY'
        } as unknown as Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
        broadcastMediator.removeClient(defaultFilename, pictureSyncClientSocketFakeout);

        expect(() => broadcastMediator.removeClient(defaultFilename, mockSocket)).toThrow(new Error(`heads up, last client for filename: ${defaultFilename} is not the broadcast client`));
    });

    it('removes the client when removeClient is called', async () => {
        mockGetRaster.mockReturnValue({
            width: 1,
            height: 1,
            data: []
        });

        await broadcastMediator.addClient(defaultFilename, mockSocket);
        const mockSocket2 = {
            id: 'mockSocket2'
        } as unknown as Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
        await broadcastMediator.addClient(defaultFilename, mockSocket2);

        const clients = broadcastMediator.listClients(defaultFilename);
        expect(clients.length).toEqual(3);
        expect(clients.includes(mockSocket2.id)).toBeTruthy();

        broadcastMediator.removeClient(defaultFilename, mockSocket2);

        const afterClients = broadcastMediator.listClients(defaultFilename);
        expect(afterClients.length).toEqual(2);
        expect(afterClients.includes(mockSocket2.id)).toBeFalsy();
    });

    it('removes the PictureSyncClient when the last client is removed', async () => {
        mockGetRaster.mockReturnValue({
            width: 1,
            height: 1,
            data: []
        });

        await broadcastMediator.addClient(defaultFilename, mockSocket);

        const clients = broadcastMediator.listClients(defaultFilename);
        expect(clients.length).toEqual(2);
        expect(clients.includes('PICTURE_SYNC_KEY')).toBeTruthy();

        broadcastMediator.removeClient(defaultFilename, mockSocket);

        const afterClients = broadcastMediator.listClients(defaultFilename);
        expect(afterClients.length).toEqual(0);
        expect(afterClients.includes('PICTURE_SYNC_KEY')).toBeFalsy();
    });

    it('sends the update to all registered', async () => {
        mockGetRaster.mockReturnValue({
            width: 1,
            height: 1,
            data: []
        });

        await broadcastMediator.addClient(defaultFilename, mockSocket);

        const dummyPixelUpdate = {
            name: 'dummyPixelUpdate',
            filename: defaultFilename
        } as unknown as PixelUpdate;
        broadcastMediator.handleUpdate(dummyPixelUpdate, mockSocket.id);

        expect(mockBroadcastHandleUpdate).toHaveBeenCalledWith(dummyPixelUpdate, mockSocket.id);
        expect(mockPictureSyncHandleUpdate).toHaveBeenCalledWith(dummyPixelUpdate, mockSocket.id);
    });

    it('silently handles missing client map for supplied filename in handleUpdate', () => {
        const dummyPixelUpdate = {
            name: 'dummyPixelUpdate',
            filename: defaultFilename
        } as unknown as PixelUpdate;
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
});
