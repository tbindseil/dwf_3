import Client from './client';
import { PixelUpdate, DWFSocket } from 'dwf-3-models-tjb';

export default class BroadcastClientFactory {
    public createBroadcastClient(socket: DWFSocket): BroadcastClient {
        return new BroadcastClient(socket);
    }
}

export class BroadcastClient extends Client {
    private readonly socket: DWFSocket;

    constructor(socket: DWFSocket) {
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

    public forcePictureWrite() {
        // TODO who writes the picture?
    }
}
