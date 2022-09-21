import Client from './client';
import { Socket } from 'socket.io';
import {
    Update,
    ServerToClientEvents,
    ClientToServerEvents,
    InterServerEvents,
    SocketData
} from 'dwf-3-models-tjb';

export default class BroadcastClient extends Client {
    private readonly socket: Socket<ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData>;

    constructor(socket: Socket<ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData>) {
        super();

        this.socket = socket;
    }

    public handleUpdate(update: Update): void {
        // this.socket.emit(update);
    }
}
