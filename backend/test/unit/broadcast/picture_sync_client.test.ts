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

jest.mock('../../../src/broadcast/picture_sync_client');
const mockPictureSyncClient = jest.mocked(PictureSyncClient, true);

jest.mock('../../../src/broadcast/queue');
const mockQueueClass = jest.mocked(Queue, true);

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

    const queue = new Queue();
    const pictureSyncClient = new PictureSyncClient(
        queue,
        mockPictureAccessor,
        mockRaster
    );

    beforeEach(() => {
        mockPictureSyncClient.mockClear();
        // mockQueue.mockClear();
        mockWriteRaster.mockClear();
        mockHandlePixelUpdate.mockClear();
    });

    it('ultimately update to the raster', async () => {
        mockHandlePixelUpdate.mockImplementation(() => {
            throw Error('intentional');
        });

        pictureSyncClient.handleUpdate(dummyPixelUpdate, mockSocket.id);

        await expect(
            pictureSyncClient.handleUpdate(dummyPixelUpdate, mockSocket.id)
        ).rejects.toThrow();

        // oh man, I think the above will fail also,
        // the exception will come from somewhere else maybe
        // if so i need to still figure out a cleaner way to
        // wait for a condition to become true
        // expect(updated).toBe(true);
    });
});
