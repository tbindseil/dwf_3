import Client from './client';
import { Socket } from 'socket.io';
import {
    PixelUpdate,
    ServerToClientEvents,
    ClientToServerEvents,
    InterServerEvents,
    SocketData
} from 'dwf-3-models-tjb';

export default class BroadcastClient extends Client {
    private readonly socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

    constructor(socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) {
        super();

        this.socket = socket;
    }

    public handleUpdate(pixelUpdate: PixelUpdate): void {
        this.socket.emit('server_to_client_update', pixelUpdate);
    }
}
