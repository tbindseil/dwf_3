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
    private clientSynced: boolean;

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
        this.clientSynced = false;
    }

    public notifySynchronized() {
        this.clientSynced = true;
    }

    public handleUpdate(pixelUpdate: PixelUpdate): void {
        // TODO switch installed handlers to avodi if
        if (this.clientSynced) {
            this.socket.emit('server_to_client_update', pixelUpdate);
        }
    }

    public close(): void {
        this.socket._cleanup();
    }
}
