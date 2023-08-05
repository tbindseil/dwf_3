import { Socket } from 'socket.io';
import Client from './client';
import {
    ClientToServerEvents,
    InterServerEvents,
    PixelUpdate,
    ServerToClientEvents,
    SocketData,
} from 'dwf-3-models-tjb';

export class BroadcastClient extends Client {
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
        super();

        this.socket = socket;
    }

    public handleUpdate(
        pixelUpdate: PixelUpdate,
        sourceSocketId: string
    ): void {
        if (sourceSocketId !== this.socket.id) {
            this.socket.emit('server_to_client_update', pixelUpdate);
        }
    }

    public close(): void {
        // do nothing
    }
}
