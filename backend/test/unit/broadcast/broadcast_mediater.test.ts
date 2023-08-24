import { Socket } from 'socket.io';
import { ClientToServerEvents } from 'dwf-3-models-tjb';
import { ServerToClientEvents } from 'dwf-3-models-tjb';
import { InterServerEvents } from 'dwf-3-models-tjb';
import { SocketData } from 'dwf-3-models-tjb';
import BroadcastMediator from '../../../src/broadcast/broadcast_mediator';
import {
    TrackedPicture,
    makeTrackedPicture,
} from '../../../src/broadcast/tracked_picture';
import PictureAccessor from '../../../src/picture_accessor/picture_accessor';
import { instance, mock } from 'ts-mockito';

jest.mock('../../../src/broadcast/tracked_picture');
const mockMakeTrackedPicture = jest.mocked(makeTrackedPicture, true);

describe('BroadcastMediator Tests', () => {
    const filename = 'filename';

    const mockSocket1 = {} as unknown as Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >;
    const mockSocket2 = {} as unknown as Socket<
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

    const broadcastMediator = new BroadcastMediator(mockPictureAccessor);

    // can probably msetInterval
    it('enqueues writes on an interval if tracked pictures are not stopped', async () => {
        broadcastMediator.addClient(filename, mockSocket1);
        broadcastMediator.addClient(filename, mockSocket2);

        // advanvce 30001 to trigger the interval callback
        jest.advanceTimersByTime(30001);

        mockTrackedPictures.forEach((value: TrackedPicture) =>
            expect(value.enqueueWrite).toHaveBeenCalled()
        );
    });

    it('enqueues writes on a high priority every once in a while', async () => {});

    it('adds client by enqueueing an operation to a tracked picture', () => {});

    it('removes clients', () => {});

    it('broadcasts updates', () => {});
});
