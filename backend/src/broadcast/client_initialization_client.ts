import {Socket} from 'socket.io';
import Client from './client';
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData, PixelUpdate } from 'dwf-3-models-tjb';
import {Job, Queue} from './queue';
import {PictureSyncClient} from './picture_sync_client';
import {BroadcastClient} from './broadcast_client';

// this:
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
        const [lastWrittenRasterCopy, pendingUpdates] = pictureSyncClient.getLastWrittenRasterCopy();

        // setup the queue with the pending updates from the last time this copy of the raster was written
        // (and therefore updates that don't exist on our copy of the raster)
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
        // that switch (the queue's finishedCallback), never relinquishes control, so it is atomic
        // and therefore, the next update will certainly come in and be emitted immediately by the broadcastClient
        this.socket.emit('join_picture_response', lastWrittenRasterCopy.toJoinPictureResponse());
    }

    public handleUpdate(pixelUpdate: PixelUpdate): void {
        if (this.clientSynced) {
            // TODO can probably remove below, but not sure how the omitted arg will behave
            // this.queue.push(() => new Promise(resolve => this.socket.emit('server_to_client_update', pixelUpdate)) )
            this.queue.push(() => new Promise(() => this.socket.emit('server_to_client_update', pixelUpdate)) )
        }
    }

    public close(): void {
        this.queue.clearFinishedCallback();
        this.queue.cancelRemainingJobs();
    }

    private readonly waitForClientToRecieveInitialRaster: Job = async (): Promise<void> => {
        // i think this is a semaphore
        // TODO this is obviously a placeholder
        // apparently this is built in to socket.io as acknowledgements:
        // https://socket.io/docs/v3/emitting-events/#acknowledgements
        await new Promise((r) => setTimeout(r, 1000));
    }
}
