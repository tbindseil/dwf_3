import {
    ClientToServerEvents,
    InterServerEvents,
    PixelUpdate,
    ServerToClientEvents,
    SocketData,
} from 'dwf-3-models-tjb';
import { Raster } from 'dwf-3-raster-tjb';
import PictureAccessor from '../../../src/picture_accessor/picture_accessor';
import { PictureSyncClient } from '../../../src/broadcast/picture_sync_client';
import { Socket } from 'socket.io';
import { Queue } from '../../broadcast/queue';

jest.mock('../../../src/broadcast/picture_sync_client');
const mockPictureSyncClient = jest.mocked(PictureSyncClient, true);

describe('PictureSyncClient Tests', () => {
    const defaultFilename = 'filename';
    const mockSocket = {
        id: 'mockSocketID',
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

    const mockWriteRaster = jest.fn();
    const mockPictureAccessor = {
        writeRaster: mockWriteRaster,
    } as unknown as PictureAccessor;

    const mockHandlePixelUpdate = jest.fn();
    const mockRaster = {
        handlePixelUpdate: mockHandlePixelUpdate,
    } as unknown as Raster;

    // TODO do i need to mock this?
    const mockQueue = new Queue();
    const pictureSyncClient = new PictureSyncClient(
        mockQueue,
        mockPictureAccessor,
        mockRaster
    );

    beforeEach(() => {
        mockPictureSyncClient.mockClear();
        mockWriteRaster.mockClear();
        mockHandlePixelUpdate.mockClear();
    });

    it('passes the update to the raster', () => {
        pictureSyncClient.handleUpdate(dummyPixelUpdate, mockSocket.id);

        expect(mockHandlePixelUpdate).toHaveBeenCalledWith(dummyPixelUpdate);
    });
});
