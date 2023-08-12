import {Socket} from 'socket.io';
import Client from './client';
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData, PixelUpdate } from 'dwf-3-models-tjb';
import {Job, Queue} from './queue';
import {PictureSyncClient} from './picture_sync_client';
import {BroadcastClient} from './broadcast_client';

// needs to:
// 1. send picture at a known point
// 2. save and send any updates that happen while that is happening
// 3. once complete, signal to the broadcast client that it can start sending
export default class ClientInitalizationClient extends Client {
    private readonly queue: Queue;
    private readonly socket: Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >;
    private clientSynced: boolean;

    constructor(
        queue: Queue,
        socket: Socket<
            ClientToServerEvents,
            ServerToClientEvents,
            InterServerEvents,
            SocketData
        >,
    ) {
        super();
        this.queue = queue;
        this.socket = socket;
        this.clientSynced = false;
    }

    public async initialize(broadcastClient: BroadcastClient, pictureSyncClient: PictureSyncClient) {
        // I think I have to copy it while its locked
        // its not a copy, maybe psc provides it as a copy

        const [lastWrittenRasterCopy, pendingUpdates] = await pictureSyncClient.getLastWrittenRaster();

        // setup the queue with the pending updates from the last time this copy of the raster was written
        // and setup the queue to syncrhonize this and the associated broadcast client for the same socket
        this.queue.push(this.waitForClientToRecieveInitialRaster);
        pendingUpdates.forEach(u => this.handleUpdate(u));
        this.queue.setFinishedCallback(() => {
            this.clientSynced = true;
            broadcastClient.notifySynchronized();
        });

        // give the client the last written raster
        // the client will respond, that will allow the first job in the queue (waitForClientToRecieveInitialRaster) to complete
        // then the rest of the updates will  be emitted
        // while that is going on, new updates are enqueued
        // until finally all are processed and the broadcast client starts emitting updates
        this.socket.emit('join_picture_response', lastWrittenRasterCopy.toJoinPictureResponse());

        // see i just moved the problem
        // now i want to read it here but its invalid without knowing what updates haven't happened
        // but...
        // i am breaking the client level of abstraction here wrt to broadcast client
        // so maybe I could break the abstraction here wrt to psc
        //
        // if abstraction is broken,
        // I can ask psc for the raster at a point with all its enqueued updates
        //
        // then, I can use send that raster, upon completion (TODO notify picture received)
        // I can start sending the queued updates
        //
        // once those are complete,
        // I signal to broadcast client to sync it up
        //
        // all of htis has to happen very carefully
    }

    public handleUpdate(pixelUpdate: PixelUpdate): void {
        if (this.clientSynced) {
            this.queue.push(() => new Promise(resolve => this.socket.emit('server_to_client_update', pixelUpdate)) )
        }
    }

    public close(): void {
        console.log('todo cancel remaining jobs if not synced');
    }

    private readonly waitForClientToRecieveInitialRaster: Job = async (): Promise<void> => {
        // i think this is a semaphore
        // TODO this is obviously a placeholder
        // apparently this is built in to socket.io as acknowledgements:
        // https://socket.io/docs/v3/emitting-events/#acknowledgements
        await new Promise((r) => setTimeout(r, 1000));
    }
}
