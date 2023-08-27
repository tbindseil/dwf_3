import {
    ClientToServerEvents,
    InterServerEvents,
    PixelUpdate,
    ServerToClientEvents,
    SocketData,
} from 'dwf-3-models-tjb';
import { BroadcastClient } from '../../../src/broadcast/broadcast_client';
import { Socket } from 'socket.io';
import {Raster} from 'dwf-3-raster-tjb';

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
    const mockRaster = {
        width: 'width',
        height: 'height',
        getBuffer: () => { 'data' },
    } as unknown as Raster;

    const broadcastClient = new BroadcastClient(mockSocket);

    beforeEach(() => {
        mockEmit.mockClear();
    });

    it('initializes the raster by sending join_picture_request', () => {
        broadcastClient.initializeRaster(mockRaster);
        expect(mockEmit).toHaveBeenCalledWith('join_picture_response', {
            width: mockRaster.width,
            height: mockRaster.height,
            data: mockRaster.getBuffer(),
        });
    });

    it('passes the update to the socket if the id does not match', () => {
        broadcastClient.handleUpdate(dummyPixelUpdate, mockSocket.id + 'DIFFERENTIATING_SUFFIX');

        expect(mockEmit).toHaveBeenCalledWith(
            'server_to_client_update',
            dummyPixelUpdate
        );
    });

    it('passes the update to the socket if the id matches', () => {
        broadcastClient.handleUpdate(dummyPixelUpdate, mockSocket.id);

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
