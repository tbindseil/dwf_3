import { Raster } from 'dwf-3-raster-tjb';
import { Priority, Queue, Job } from '../../../src/broadcast/queue';
import { TrackedPicture } from '../../../src/broadcast/tracked_picture';
import PictureAccessor from '../../../src/picture_accessor/picture_accessor';
import { BroadcastClient } from '../../broadcast/broadcast_client';
import { PixelUpdate } from 'dwf-3-models-tjb';

describe('TrackedPicture Tests', () => {
    const filename = 'filename';
    const priority = Priority.ONE;
    const socketId1 = 'socketId1';
    const socketId2 = 'socketId2';
    const copiedRaster = 'copiedRaster';

    const mockUpdateRaster = jest.fn();
    const pixelUpdate = {
        filename: filename,
        createdBy: 'tj',
        x: 4,
        y: 20,
        red: 255,
        green: 255,
        blue: 255,
        updateRaster: mockUpdateRaster,
    } as unknown as PixelUpdate;

    const mockHandleUpdate1 = jest.fn();
    const mockInitializeRaster1 = jest.fn();
    const mockBroadcastClient1 = {
        handleUpdate: mockHandleUpdate1,
        initializeRaster: mockInitializeRaster1,
    } as unknown as BroadcastClient;

    const mockHandleUpdate2 = jest.fn();
    const mockInitializeRaster2 = jest.fn();
    const mockBroadcastClient2 = {
        handleUpdate: mockHandleUpdate2,
        initializeRaster: mockInitializeRaster2,
    } as unknown as BroadcastClient;

    const mockCopy = jest.fn();
    const mockHandlePixelUpdate = jest.fn();
    const mockGetBuffer = jest.fn();
    const mockRaster = {
        copy: mockCopy,
        handlePixelUpdate: mockHandlePixelUpdate,
        getBuffer: mockGetBuffer,
    } as unknown as Raster;

    let pushedJob: Job;
    const mockPush = jest.fn();
    const mockQueue = {
        push: mockPush,
    } as unknown as Queue;

    const mockGetRaster = jest.fn();
    const mockWriteRaster = jest.fn();
    const mockPictureAccessor = {
        readRaster: mockGetRaster,
        writeRaster: mockWriteRaster,
    } as unknown as PictureAccessor;

    let trackedPicture: TrackedPicture;

    beforeEach(() => {
        mockHandleUpdate1.mockClear();
        mockInitializeRaster1.mockClear();

        mockHandleUpdate2.mockClear();
        mockInitializeRaster2.mockClear();

        mockCopy.mockClear();
        mockCopy.mockReturnValue(copiedRaster);
        mockHandlePixelUpdate.mockClear();
        mockGetBuffer.mockClear();

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

    it('reads the raster when first client is added', async () => {
        await addClient();

        expect(mockPush).toBeCalledTimes(1);

        expect(mockGetRaster).toHaveBeenCalledWith(filename);
        expect(mockInitializeRaster1).toHaveBeenCalledWith(copiedRaster);
    });

    it('reads the raster when first client is added', async () => {
        await addClient();
        await addClient();

        expect(mockGetRaster).toHaveBeenCalledTimes(1);
        expect(mockInitializeRaster1).toHaveBeenCalledTimes(2);
    });

    it('sends pending updates to new client', async () => {
        await addClient();

        await sendUpdate();
        await sendUpdate();

        mockInitializeRaster1.mockClear();
        mockHandleUpdate1.mockClear();

        await addClient();
        expect(mockInitializeRaster1).toHaveBeenCalledTimes(1);
        expect(mockHandleUpdate1).toHaveBeenCalledTimes(2);
    });

    it('adds clients to the map', async () => {
        await addClient();
        await sendUpdate();
        await updateLocalRaster();

        await addClient(mockBroadcastClient2, socketId2);
        await sendUpdate();

        expect(mockHandleUpdate1).toHaveBeenCalledTimes(2);
        expect(mockHandleUpdate2).toHaveBeenCalledTimes(1);
    });

    it('does not write the raster if not dirty', async () => {
        await addClient();
        await writeRaster();

        expect(mockWriteRaster).toHaveBeenCalledTimes(0);
    });

    it('writes the raster if dirty', async () => {
        await addClient();
        await sendUpdate();
        await updateLocalRaster();
        await writeRaster();

        expect(mockWriteRaster).toHaveBeenCalledTimes(1);
    });

    it('does not enqueue a second write if a current write is pending', async () => {
        await addClient();
        await sendUpdate();
        await updateLocalRaster();
        await writeRaster();

        pushedJob = (): Promise<void> => {
            return new Promise((r) => r());
        };

        await writeRaster();

        expect(mockWriteRaster).toHaveBeenCalledTimes(1);
    });

    it('enqueues a second write if force is provided, even if a current write is pending', async () => {
        await addClient();
        await sendUpdate();
        await updateLocalRaster();
        await writeRaster();

        let resetFunctionCalled = false;
        pushedJob = (): Promise<void> => {
            return new Promise((r) => {
                resetFunctionCalled = true;
                r();
            });
        };

        await writeRaster(true);

        expect(mockWriteRaster).toHaveBeenCalledTimes(1);
        expect(resetFunctionCalled).toBe(false);
    });

    it.skip('returns stopped after the last client is removed and a write happens', async () => {
        await addClient();
        await sendUpdate();
        await removeClient();

        expect(trackedPicture.stopped()).toBe(false);

        await updateLocalRaster();
        await writeRaster();

        expect(trackedPicture.stopped()).toBe(true);
    });

    it('throws when update local raster happens without pending updates', async () => {
        await addClient();
        await sendUpdate();
        await updateLocalRaster();
        await expect(updateLocalRaster()).rejects.toThrow();
    });

    const removeClient = async () => {
        trackedPicture.enqueueRemoveClient(priority, socketId1);
        await pushedJob();
    };

    const writeRaster = async (force: boolean = false) => {
        trackedPicture.enqueueWrite(priority, force);
        await pushedJob();
    };

    const addClient = async (
        broadcastClient = mockBroadcastClient1,
        socketId: string = socketId1
    ) => {
        trackedPicture.enqueueAddClient(priority, socketId, broadcastClient);
        await pushedJob();
    };

    const sendUpdate = async () => {
        trackedPicture.enqueueBroadcastUpdate(priority, pixelUpdate);
        await pushedJob();
    };

    const updateLocalRaster = async () => {
        trackedPicture.enqueueUpdateLocalRaster(priority);
        await pushedJob();
    };
});
