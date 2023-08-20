import { Raster } from 'dwf-3-raster-tjb';
import { Priority, Queue, Job } from '../../../src/broadcast/queue';
import { TrackedPicture } from '../../../src/broadcast/tracked_picture';
import PictureAccessor from '../../../src/picture_accessor/picture_accessor';
import { BroadcastClient } from '../../broadcast/broadcast_client';

describe('TJTAG TrackedPicture Tests', () => {
    const filename = 'filename';
    const priority = Priority.ONE;
    const socketId = 'socketId';
    const copiedRaster = 'copiedRaster';

    const mockHandleUpdate = jest.fn();
    const mockInitializeRaster = jest.fn();
    const mockBroadcastClient = {
        handleUpdate: mockHandleUpdate,
        initializeRaster: mockInitializeRaster,
    } as unknown as BroadcastClient;

    const mockCopy = jest.fn();
    const mockHandlePixelUpdate = jest.fn();
    const mockRaster = {
        copy: mockCopy,
        handlePixelUpdate: mockHandlePixelUpdate,
    } as unknown as Raster;

    let pushedJob: Job;
    const mockPush = jest.fn();
    const mockQueue = {
        push: mockPush,
    } as unknown as Queue;

    const mockGetRaster = jest.fn();
    const mockWriteRaster = jest.fn();
    const mockPictureAccessor = {
        getRaster: mockGetRaster,
        writeRaster: mockWriteRaster,
    } as unknown as PictureAccessor;

    let trackedPicture: TrackedPicture;

    beforeEach(() => {
        mockHandleUpdate.mockClear();
        mockInitializeRaster.mockClear();

        mockCopy.mockClear();
        mockCopy.mockReturnValue(copiedRaster);
        mockHandlePixelUpdate.mockClear();

        mockPush.mockClear();
        mockPush.mockImplementation((priority: Priority, job: Job) => {
            pushedJob = job;
        });

        mockGetRaster.mockClear();
        mockGetRaster.mockReturnValue(mockRaster);
        mockWriteRaster.mockClear();

        trackedPicture = new TrackedPicture(
            mockQueue,
            mockPictureAccessor,
            filename
        );
    });

    it('enqueueWrite adds a write operation', () => {
        const force = true;

        trackedPicture.enqueueWrite(priority, force);

        expect(mockPush).toBeCalledTimes(1);

        pushedJob();

        expect;
    });

    it.only('reads the raster when first client is added', async () => {
        trackedPicture.enqueueAddClient(
            priority,
            socketId,
            mockBroadcastClient
        );

        expect(mockPush).toBeCalledTimes(1);

        await pushedJob();

        expect(mockInitializeRaster).toHaveBeenCalledWith(copiedRaster);
    });
});
