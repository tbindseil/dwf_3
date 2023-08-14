import {
    ClientToServerEvents,
    InterServerEvents,
    PixelUpdate,
    ServerToClientEvents,
    SocketData,
} from 'dwf-3-models-tjb';
import { BroadcastClient } from '../../../src/broadcast/broadcast_client';
import { Socket } from 'socket.io';

describe('BroadcastClient Tests', () => {
    const defaultFilename = 'filename';

    const mockEmit = jest.fn();
    const mockCleanup = jest.fn();
    const mockSocket = {
        emit: mockEmit,
        id: 'mockSocketID',
        _cleanup: mockCleanup
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

    const broadcastClient = new BroadcastClient(mockSocket);

    beforeEach(() => {
        mockEmit.mockClear();
    });

    it('passes the update to the socket if the id does not match', () => {
        broadcastClient.handleUpdate(dummyPixelUpdate);

        expect(mockEmit).toHaveBeenCalledWith(
            'server_to_client_update',
            dummyPixelUpdate
        );
    });

    it('closes socket on close', () => {
        broadcastClient.close();
        expect(mockCleanup).toBeCalled();
    });
});
