import Client from './client';
import { Socket } from 'socket.io';
import {
    PixelUpdate,
    ServerToClientEvents,
    ClientToServerEvents,
    InterServerEvents,
    SocketData
} from 'dwf-3-models-tjb';

export default class BroadcastClientFactory {
    public createBroadcastClient(socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>): BroadcastClient {
        return new BroadcastClient(socket);
    }
}

export class BroadcastClient extends Client {
    private readonly socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

    constructor(socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) {
        super();

        this.socket = socket;
    }

    public handleUpdate(pixelUpdate: PixelUpdate, sourceSocketId: string): void {
        if (sourceSocketId !== this.socket.id) {
            this.socket.emit('server_to_client_update', pixelUpdate);
        }
    }

    public forcePictureWrite() {

    }
}
