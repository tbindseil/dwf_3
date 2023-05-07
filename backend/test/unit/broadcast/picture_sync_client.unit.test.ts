import { // TODO linter
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData,
    PixelUpdate
} from "dwf-3-models-tjb";
import {Raster} from "dwf-3-raster-tjb";
import {Socket} from "socket.io";
import {getSingleFunctionMock} from "../../mock/mock_adapter";
import PictureAccessor from "../../../src/picture_accessor/picture_accessor";
import PictureSyncClientFactory from "../../../src/broadcast/picture_sync_client";

describe('PictureSyncClient Tests', () => {
    const defaultFilename = 'filename';
    const mockSocket = {
        id: 'mockSocketID'
    } as unknown as Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
    const dummyPixelUpdate = {
        name: 'dummyPixelUpdate',
        filename: defaultFilename
    } as unknown as PixelUpdate;

    const [mockWriteRaster, mockPictureAccessor] = getSingleFunctionMock<PictureAccessor>({
        writeRaster: 'none'
    });

    const [mockHandlePixelUpdate, mockRaster] = getSingleFunctionMock<Raster>({
        handlePixelUpdate: 'none'
    });

    const pictureSyncClient = new PictureSyncClientFactory().createPictureSyncClient(mockPictureAccessor, mockRaster);

    beforeEach(() => {
        mockWriteRaster.mockClear();
        mockHandlePixelUpdate.mockClear();
    });

    it('passes the update to the raster', () => {
        pictureSyncClient.handleUpdate(dummyPixelUpdate, mockSocket.id);

        expect(mockHandlePixelUpdate).toHaveBeenCalledWith(dummyPixelUpdate);
    });

    it('writes on forcePictureWrite', () => {
        pictureSyncClient.forcePictureWrite();

        expect(mockWriteRaster).toHaveBeenCalledWith(mockRaster);
    });
});
