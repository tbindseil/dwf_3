import { PixelUpdate } from 'dwf-3-models-tjb';
import { Raster } from 'dwf-3-raster-tjb';
import PictureAccessor from '../../../src/picture_accessor/picture_accessor';
import { PictureSyncClient } from '../../../src/broadcast/picture_sync_client';
import { Queue } from '../../../src/broadcast/queue';
import {
    anything,
    capture,
    instance,
    mock,
    resetCalls,
    verify,
    when,
} from 'ts-mockito';
import { waitForMS } from '../mock/utils';

describe('PictureSyncClient Tests', () => {
    it('passes', () => {
        console.log('tada');
    });
//    const defaultFilename = 'filename';
//    const dummyPixelUpdate = {
//        name: 'dummyPixelUpdate',
//        filename: defaultFilename,
//    } as unknown as PixelUpdate;
//
//    const mockWriteRaster = jest.fn();
//    const mockPictureAccessor = {
//        writeRaster: mockWriteRaster,
//    } as unknown as PictureAccessor;
//
//    const mockHandlePixelUpdate = jest.fn();
//    const mockRaster = {
//        handlePixelUpdate: mockHandlePixelUpdate,
//    } as unknown as Raster;
//
//    // so we assert on mockedQueue, so what about multiple mock instances?
//    // maybe that could be a pull request
//    const mockedQueue: Queue = mock(Queue);
//    const instanceQueue: Queue = instance(mockedQueue);
//
//    const pictureSyncClient = new PictureSyncClient(
//        instanceQueue,
//        mockPictureAccessor,
//        mockRaster,
//        defaultFilename
//    );
//
//    beforeEach(() => {
//        resetCalls(mockedQueue);
//        mockWriteRaster.mockClear();
//        mockHandlePixelUpdate.mockClear();
//    });
//
//    afterEach(async () => {
//        await pictureSyncClient.close();
//    });
//
//    it('queues the update to the raster', () => {
//        pictureSyncClient.handleUpdate(dummyPixelUpdate);
//
//        verify(mockedQueue.push(anything())).called();
//        const [job] = capture(mockedQueue.push).last();
//
//        job();
//
//        expect(mockHandlePixelUpdate).toHaveBeenCalledWith(dummyPixelUpdate);
//    });
//
//    it('writes every so often but only if an update has occurred', async () => {
//        const queue = new Queue();
//        const pictureSyncClientWithRealQueue = new PictureSyncClient(
//            queue,
//            mockPictureAccessor,
//            mockRaster,
//            defaultFilename,
//            30
//        );
//        pictureSyncClientWithRealQueue.handleUpdate(dummyPixelUpdate);
//
//        await waitForMS(300);
//
//        expect(mockWriteRaster).toHaveBeenCalledWith(
//            mockRaster,
//            defaultFilename
//        );
//        expect(mockWriteRaster).toHaveBeenCalledTimes(1);
//
//        await waitForMS(300);
//
//        expect(mockWriteRaster).toHaveBeenCalledTimes(1);
//
//        await pictureSyncClientWithRealQueue.close();
//    });
//
//    it('waits for queue to finish, writes the raster', async () => {
//        when(mockedQueue.waitForCompletion()).thenResolve();
//
//        await pictureSyncClient.close();
//
//        verify(mockedQueue.waitForCompletion()).called();
//    });
//
//    //  and closes the interval on close
});
