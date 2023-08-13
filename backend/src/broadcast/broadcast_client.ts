import { Socket } from 'socket.io';
import Client from './client';
import {
    ClientToServerEvents,
    InterServerEvents,
    PixelUpdate,
    ServerToClientEvents,
    SocketData,
} from 'dwf-3-models-tjb';
import {Raster} from 'dwf-3-raster-tjb';

export class BroadcastClient extends Client {
    private readonly socket: Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >;
    private initialRasterSent: boolean;

    constructor(
        socket: Socket<
            ClientToServerEvents,
            ServerToClientEvents,
            InterServerEvents,
            SocketData
        >
    ) {
        super();

        this.socket = socket;
        this.initialRasterSent = false;
    }

    public override handleUpdate(pixelUpdate: PixelUpdate): void {
        // TODO switch installed handlers to avodi if
        if (this.initialRasterSent) {
            this.socket.emit('server_to_client_update', pixelUpdate);
        }
    }

    public override close(): void {
        this.socket._cleanup();
    }

    public synchronize(copiedRaster: Raster) {
        this.socket.emit('join_picture_response', copiedRaster.toJoinPictureResponse());
        this.initialRasterSent = true;
    }
}
