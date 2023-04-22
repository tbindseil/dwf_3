import PictureAccessor from "../picture_accessor/picture_accessor";
import BroadcastMediator from "../../src/broadcast/broadcast_mediator";
import {ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData} from "dwf-3-models-tjb";
import {Socket} from "socket.io";

describe('BroadcastMediator Tests', () => {
    const mockGetRaster = jest.fn();
    const mockPictureAccessor = {
        getRaster: mockGetRaster
    } as unknown as PictureAccessor;

    const broadcastMediator = new BroadcastMediator(mockPictureAccessor);

    beforeEach(() => {
        mockGetRaster.mockClear();
    });

    it('throws when pictureAccessor.getRaster throws', async () => {
        const mockSocket = {
            id: 'id'
        } as unknown as Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
        mockGetRaster.mockRejectedValue(new Error());

        await expect(broadcastMediator.addClient('filename', mockSocket)).rejects.toThrow();
    });

    it('adds a PictureSyncClient with the first client for a picture', () => {
    });

    it('adds the client when addClient is called', () => {
    });

    it('throws when filename is not present in map', () => {
    });

    it('throws when socket id is not present in map', () => {
    });

    it('throws when PictureSyncClient is not the last client', () => {
    });

    it('removes the client when removeClient is called', () => {
        console.log('Sydney was here');
    });

    it('sends the update to all registered', () => {
    });
});
