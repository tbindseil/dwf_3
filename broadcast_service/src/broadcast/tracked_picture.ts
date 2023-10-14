import { Priority, Queue } from './queue';
import { Raster } from 'dwf-3-raster-tjb';
import { Update } from 'dwf-3-models-tjb';
import PictureAccessor from '../picture_accessor/picture_accessor';
import { BroadcastClient } from './broadcast_client';

// for injecting mocks into unit tests
export const makeTrackedPicture = (
    queue: Queue,
    pictureAccessor: PictureAccessor,
    filename: string
) => new TrackedPicture(queue, pictureAccessor, filename);

export class TrackedPicture {
    private readonly idToClientMap: Map<string, BroadcastClient> = new Map();
    private readonly workQueue: Queue;
    private readonly pictureAccessor: PictureAccessor;
    private readonly filename: string;
    private dirty = false;
    private writeEnqueued = false;
    private raster?: Raster;

    // these are updates that have been broadcast but haven't been applied to the local copy of the raster
    pendingUpdates: Update[] = [];
    public constructor(
        queue: Queue,
        pictureAccessor: PictureAccessor,
        filename: string
    ) {
        this.workQueue = queue;
        this.pictureAccessor = pictureAccessor;
        this.filename = filename;
    }

    // why do i want to go back to offloading this onto another
    // service?
    // what would that service do?
    // well, it would write the raster to s3
    // what does that entail?
    // it has to know the updates, it receives the stuff from local raster
    //
    // that services integ tests are as follows:
    // throw updaters at it, expect them to get to disc (s3)
    // sqs
    //
    // sqs
    //
    // sqs
    //
    // sqs
    //
    // sqs
    //
    //
    // sqs
    //
    // is it really that simple?
    // enqueue it, and the lambda will dequeue, update picture and enqueue ot another topic
    // that other topic is a writer that also has access to the picture, so  i guess its another endpoint on the lambda
    //
    // this writer endpoint waits..... how does it do this? every X times it gets called it actually writes, and it is also subscribed
    // to end events? or maybe it has a force flag and the main (broadcast) service calls the endpoint directly instead of it
    // getting called as a part of the sqs response
    //
    // then, we can stub out the picture sync service (above) when integ testing this thing and that way we know
    // that it is sending those update main picture messages
    //
    // first i guess i will do some cdk
    //
    // that's all good but how will new clients who join get the raster?
    // well, I think the existing mechanism will have to remain
    //
    // and upon a new one starting up (new tracked_picture that is:)
    // we get it from s3
    //
    // that leaves coordination with the sqs and knowing that it is done processing
    //
    //
    //
    // ok here it is,
    // it stays untouched, until the writer is done with the force (ie close?)
    // then, it calls remove client which happens if and only if there are no newly added
    // clients
    //
    //
    // and it removes the tracked picture
    //
    // that only happens after a clean write
    //
    //
    // and there is no need for this stopped crap or putting that write somewhere else crap

    public enqueueWrite(priority: Priority, force = false) {
        console.log(
            `enqueueWrite with
            priority: ${priority}
            force: ${force}
            this.writeEnqueued: ${this.writeEnqueued}
            this.dirty: ${this.dirty}
            raster?: ${this.raster}
            this.idToClientMap: ${this.idToClientMap}`
        );
        if (force || !this.writeEnqueued) {
            this.workQueue.push(priority, async () => {
                if (this.raster && this.dirty) {
                    console.log('@@ TJTAG @@ WRITING RASTER');
                    await this.pictureAccessor.writeRaster(
                        this.raster,
                        this.filename
                    );

                    this.dirty = false;
                    console.log('setting writeEnqueued to false');
                    this.writeEnqueued = false;

                    // if we write and there are no clients, release the raster
                    // no clients means noone can send updates
                    // write priority (determined by BroadcastMediator) means
                    // there were no more local picture update events
                    if (this.idToClientMap.size === 0) {
                        this.raster = undefined;
                    }
                }
            });

            console.log('setting writeEnqueued to true');
            this.writeEnqueued = true;
        }
    }

    public enqueueAddClient(
        priority: Priority,
        socketId: string,
        broadcastClient: BroadcastClient
    ) {
        this.workQueue.push(priority, async () => {
            this.idToClientMap.set(socketId, broadcastClient);

            // cold start
            if (!this.raster) {
                this.raster = await this.pictureAccessor.readRaster(
                    this.filename
                );
            }

            const copiedRaster = this.raster.copy();
            broadcastClient.initializeRaster(copiedRaster);

            // this one is just getting added, hence the arbitrary non matching socketid
            this.pendingUpdates.forEach((u) => {
                broadcastClient.handleUpdate(u);
            });
        });
    }

    public enqueueRemoveClient(priority: Priority, socketId: string) {
        this.workQueue.push(priority, async () => {
            const broadcastClient = this.idToClientMap.get(socketId);
            if (broadcastClient) {
                broadcastClient.close();
            }
            this.idToClientMap.delete(socketId);
        });
    }

    public enqueueBroadcastUpdate(priority: Priority, update: Update) {
        this.workQueue.push(priority, async () => {
            this.idToClientMap.forEach((client: BroadcastClient) => {
                client.handleUpdate(update);
            });

            this.pendingUpdates.push(update);
        });
    }

    public enqueueUpdateLocalRaster(priority: Priority) {
        this.workQueue.push(priority, async () => {
            if (this.raster) {
                const nextUpdate = this.pendingUpdates.shift();
                if (!nextUpdate) {
                    console.error(
                        'nextUpdate is undefined, something went horribly wrong'
                    );
                    throw Error('stack trace');
                }
                Update.updateRaster(this.raster, nextUpdate);
                this.dirty = true;
            }
        });
    }

    public stopped(): boolean {
        return !this.raster && this.idToClientMap.size == 0;
    }
}
