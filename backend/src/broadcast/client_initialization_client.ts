import {Socket} from 'socket.io';
import Client from './client';
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData, PixelUpdate } from 'dwf-3-models-tjb';
import {PictureSyncClient} from './picture_sync_client';
import {BroadcastClient} from './broadcast_client';

// this:
// note, the updates under scrutinty are definitely duplicated
// 1. query for a snapshot of the raster, in addition to all updates that have happened since that snap shot (wait! will this also include the updates this is supposed to help with?) TODO
// 2. then send the raster snapshot to new client
// 3. then send updates that had already occured to the picture between known point and initializing (these are potentially duplicated)
// 4. save and updates that happen while that is happening <---- this one can happen asynchronously
// 5. send those after the updates in step 2
// 6. once complete, signal to the broadcast client that it can start sending
export default class ClientInitalizationClient extends Client {
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
        >,
    ) {
        super();
        this.socket = socket;
    }

    public override handleUpdate(pixelUpdate: PixelUpdate): void {
        // do nothing
    }

    public override close(): void {
        // do nothing
    }

    // really, this could probably happen in add client
    public initialize(broadcastClient: BroadcastClient, pictureSyncClient: PictureSyncClient) {
    }
}
