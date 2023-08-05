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
import { Queue } from '../../../src/broadcast/queue';
import { anything, instance, mock, resetCalls, verify } from 'ts-mockito';

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

    const mockedQueue: Queue = mock(Queue);
    const instanceQueue: Queue = instance(mockedQueue);

    const pictureSyncClient = new PictureSyncClient(
        instanceQueue,
        mockPictureAccessor,
        mockRaster
    );

    beforeEach(() => {
        resetCalls(mockedQueue);
        mockWriteRaster.mockClear();
        mockHandlePixelUpdate.mockClear();
    });

    it('queues the update to the raster', async () => {
        pictureSyncClient.handleUpdate(dummyPixelUpdate, mockSocket.id);

        verify(mockedQueue.push(anything())).called();
    });
});
