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

// This one is the most simple.
// Either buffer the update for later, or send it immediately.
// And, that is determined by a synchronize (TODO rename to initialize maybe?)
// function that takes in the copied raster, sends it out, sends out any
// buffered updates, and then sets this to start sending updates immediately.
export class BroadcastClient extends Client {
    private readonly socket: Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >;
    private initialRasterSent = false;
    private initiallyBufferedUpdates: PixelUpdate[] = [];

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
    }

    public override handleUpdate(pixelUpdate: PixelUpdate): void {
        // TODO switch installed handlers to avodi if
        if (this.initialRasterSent) {
            this.socket.emit('server_to_client_update', pixelUpdate);
        } else {
            this.initiallyBufferedUpdates.push(pixelUpdate);
        }
    }

    public override close(): void {
        this.socket._cleanup();
    }

    public synchronize(copiedRaster: Raster) {
        this.socket.emit('join_picture_response', copiedRaster.toJoinPictureResponse());
        this.initiallyBufferedUpdates.forEach(u => this.socket.emit('server_to_client_update', u));
        this.initialRasterSent = true;
    }
}
