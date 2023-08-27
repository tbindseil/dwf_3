import { Socket } from 'socket.io';
import {
    ClientToServerEvents,
    InterServerEvents,
    PixelUpdate,
    ServerToClientEvents,
    SocketData,
    Update,
} from 'dwf-3-models-tjb';
import { Raster } from 'dwf-3-raster-tjb';

export class BroadcastClient {
    private readonly socket: Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >;

    constructor(
        socket: Socket<
            ClientToServerEvents,
            ServerToClientEvents,
            InterServerEvents,
            SocketData
        >
    ) {
        this.socket = socket;
    }

    public initializeRaster(raster: Raster): void {
        this.socket.emit(
            'join_picture_response',
            {
                width: raster.width,
                height: raster.height,
                data: raster.getBuffer()
            }
        );
    }

    public handleUpdate(update: Update, fromSocketID: string): void {
        this.socket.emit('server_to_client_update', update);
    }

    public close(): void {
        this.socket._cleanup();
    }
}
