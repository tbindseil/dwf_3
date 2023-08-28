import { Socket } from 'socket.io';
import { ClientToServerEvents, PixelUpdate } from 'dwf-3-models-tjb';
import { ServerToClientEvents } from 'dwf-3-models-tjb';
import { InterServerEvents } from 'dwf-3-models-tjb';
import { SocketData } from 'dwf-3-models-tjb';
import BroadcastMediator from '../../../src/broadcast/broadcast_mediator';
import {
    TrackedPicture,
    makeTrackedPicture,
} from '../../../src/broadcast/tracked_picture';
import PictureAccessor from '../../../src/picture_accessor/picture_accessor';
import { anything, instance, mock, resetCalls, verify, when } from 'ts-mockito';
import { Priority } from '../../../src/broadcast/queue';

jest.mock('../../../src/broadcast/tracked_picture');
const mockMakeTrackedPicture = jest.mocked(makeTrackedPicture, true);

describe('BroadcastMediator Tests', () => {
    jest.useFakeTimers();

    const filename = 'filename';

    // TODO move all these things (constants, utilities, mocks?) to one file
    const pixelUpdate = new PixelUpdate({
        filename: filename,
        createdBy: 'tj',
        x: 4,
        y: 20,
        red: 255,
        green: 255,
        blue: 255
    });

    const mockSocket1 = {
        id: '1',
    } as unknown as Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >;
    const mockSocket2 = {
        id: '2',
    } as unknown as Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >;
    const mockPictureAccessor = {} as unknown as PictureAccessor;

    // well i could
    // 1. make the whole mock interface here and save all the creations
    // 2. ts mockito to make the mocks and add factories in source code to inject them
    const mockTrackedPictures = new Map<string, TrackedPicture>();
    const mockedTrackedPicture = mock(TrackedPicture);
    const makeMockTrackedPicture = (filename: string) => {
        const instanceOfTrackedPicture = instance(mockedTrackedPicture);
        mockTrackedPictures.set(filename, instanceOfTrackedPicture);
        return instanceOfTrackedPicture;
    };

    mockMakeTrackedPicture.mockImplementation(
        (_queue, _pictureAccessor, filename) => makeMockTrackedPicture(filename)
    );

    let broadcastMediator: BroadcastMediator;

    beforeEach(() => {
        resetCalls(mockedTrackedPicture);
        mockTrackedPictures.clear();
        broadcastMediator = new BroadcastMediator(mockPictureAccessor);
    });

    it('enqueues writes on an interval if tracked pictures are not stopped', async () => {
        const otherFilename = 'otherFilename';

        broadcastMediator.addClient(filename, mockSocket1);
        broadcastMediator.addClient(otherFilename, mockSocket2);

        // advanvce 30001 to trigger the interval callback
        jest.advanceTimersByTime(30000 + 1);

        // once per tracked picture
        verify(mockedTrackedPicture.enqueueWrite(Priority.SIX, false)).twice();
    });

    it('enqueues forced, high priority writes every once in a while', async () => {
        const otherFilename = 'otherFilename';

        broadcastMediator.addClient(filename, mockSocket1);
        broadcastMediator.addClient(otherFilename, mockSocket2);

        // advanvce to trigger the interval callback
        jest.advanceTimersByTime(30000 * 128 - 1);

        // once per tracked picture
        verify(mockedTrackedPicture.enqueueWrite(Priority.ONE, true)).twice();
    });

    it('deletes when the tracked picture is stopped', () => {
        broadcastMediator.addClient(filename, mockSocket1);
        when(mockedTrackedPicture.stopped()).thenReturn(true);

        // advanvce 30001 to trigger the interval callback
        jest.advanceTimersByTime(30000 + 1);

        // once per tracked picture
        verify(mockedTrackedPicture.enqueueWrite(Priority.SIX, false)).never();
    });

    it('adds client by enqueueing an operation to a tracked picture', () => {
        broadcastMediator.addClient(filename, mockSocket1);
        verify(
            mockedTrackedPicture.enqueueAddClient(
                Priority.TWO,
                mockSocket1.id,
                anything()
            )
        ).called();
    });

    it('removes clients', () => {
        broadcastMediator.addClient(filename, mockSocket1);
        broadcastMediator.removeClient(filename, mockSocket1);
        verify(
            mockedTrackedPicture.enqueueRemoveClient(
                Priority.THREE,
                mockSocket1.id
            )
        ).called();
    });

    it('broadcasts updates', () => {
        broadcastMediator.addClient(filename, mockSocket1);
        broadcastMediator.addClient(filename, mockSocket2);
        broadcastMediator.broadcastUpdate(pixelUpdate, mockSocket1.id);
        verify(
            mockedTrackedPicture.enqueueBroadcastUpdate(
                Priority.FOUR,
                pixelUpdate,
                mockSocket1.id
            )
        ).called();
        verify(
            mockedTrackedPicture.enqueueUpdateLocalRaster(Priority.FIVE)
        ).called();
    });
});
