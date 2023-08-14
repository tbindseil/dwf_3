import Client from './client';
import { BroadcastClient } from './broadcast_client';
import PictureAccessor from '../picture_accessor/picture_accessor';

import {
    ClientToServerEvents,
    InterServerEvents,
    PixelUpdate,
    ServerToClientEvents,
    SocketData,
} from 'dwf-3-models-tjb';
import { Socket } from 'socket.io';
import { Priority, Queue } from './queue';
import {Raster} from 'dwf-3-raster-tjb';

interface TrackedPicture {
    idToClientMap: Map<string, Client>;
    dirty: boolean;
    raster?: Raster;
}

export default class BroadcastMediator {
    private readonly pictureAccessor: PictureAccessor;
    private readonly queue: Queue;
    private readonly _writeInterval: NodeJS.Timer;

    // this maps filename to all clients, where each client has a unique socket id to fetch instantly
    private readonly trackedPictures = new Map<string, TrackedPicture>();

    constructor(pictureAccessor: PictureAccessor, queue: Queue) {
        this.pictureAccessor = pictureAccessor;
        this.queue = queue;

        this._writeInterval = setInterval(() => {
            this.trackedPictures.forEach((tp, filename) => {
                queue.push(Priority.THREE, async () => {
                    if (tp.raster && tp.dirty) {
                        await this.pictureAccessor.writeRaster(tp.raster, filename)
                    }
                });
            });
        }, 30000);
    }

    public addClient(filename: string, socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) {
        const trackedPicture = this.trackedPictures.get(filename);
        if (!trackedPicture) {
            this.trackedPictures.set(filename, { idToClientMap: new Map(), dirty: false });
        }

        this.queue.push(Priority.ONE, async () => {
            const trackedPicture = this.trackedPictures.get(filename);
            if (trackedPicture) {
                trackedPicture.idToClientMap.set(socket.id, new BroadcastClient(socket));
                if (!trackedPicture.raster) {
                    trackedPicture.raster = await this.pictureAccessor.getRaster(filename);
                }
                const copiedRaster = trackedPicture.raster.copy()
                socket.emit('join_picture_response', copiedRaster.toJoinPictureResponse());
            }
        });
    }

    /// Hmm, how to schedule the removal of clients such that it is optimal (ie if add client is there, we put remove client first, and then somehow know to skip adding client)
    /// ^^^ this is an optimization that can be done once we have a working test harness
    // I think the way to do it would be to save (memoize) a map of client to a list of updates
    // then do queue .cancel job(update)? hmm that leaves something to do as well
    // private readonly REMOVE_CLIENT_PRIORITY = Priority.FOUR;

    public removeClient(
        filename: string,
        socket: Socket<
            ClientToServerEvents,
            ServerToClientEvents,
            InterServerEvents,
            SocketData
        >
    ) {

        // do i want to do this in the queue even?
        // yes, otherwise we could enqueue the final write before all updates happen
        // nope because writes always go last
        // this.queue.push(this.REMOVE_CLIENT_PRIORITY, async () => {

        // I think what this boils down to is:
        // is this raster still available if the tp is deleted?
        // if so, what do i think about hot starts / cold starts?
        //
        // well on the way home i figured it out
        //
        // first, one queue per trackedPicture
        // second remove happens synchronously in that it 
        //
        // just need a high prio write and a low prio write
        // obviously the high prio right happens very infrequently
        // this is in order to mitigate that a frequently updated picture
        // would never get to a low priority write op
        //
        // once all this is done, how much can be reduced to using the features of socket io? (ie rooms)

        // wait whos updating the raster???
        // did I just completely miss the whole thing?
        // am i losing my mind?
        //
        // I think i did forget to do that 
        // whoops lol
        // as a demonstration of the superiority of htis method,
        // i will simply enqueue something that updates the tp's raster
        //
        // damn, back to that same problem of synchronizing the updates
        //
        // two copies of the raster?
        // no... we have to keep both up to date
        //
        // what this boils down to is...
        //
        // or each tp could enqueue an update and dequeue when the update is written
        //
        // I think that's the way
        //
        //
        // so raster is with tp
        //
        // broadcast update (todo rename) will send to all
        // AND
        // add to the queue of undrawnUpdates
        //
        // then we take the 
        //
        //  i know what to do

        const trackedPicture = this.trackedPictures.get(filename);
        if (trackedPicture) {
            trackedPicture.idToClientMap.delete(socket.id);
            if (trackedPicture.idToClientMap.size === 0) {
                // enqueue write raster?
                // I don't think I even need to do that
                // any subsequent writes
                // if I delete the tracked picture here I do need to do it
                // because tracked picture is iterated over to schedule writes
                this.scheduleWrite(filename, trackedPicture.dirty, trackedPicture.raster),
                this.trackedPictures.delete(filename);
            }
        }
    }

    public handleUpdate(pixelUpdate: PixelUpdate, sourceSocketId: string) {
        this.queue.push(Priority.TWO, async () => {
            const trackedPicture = this.trackedPictures.get(pixelUpdate.filename);
            if (trackedPicture) {
                trackedPicture.idToClientMap.forEach(
                    (client: Client, socketId: string) => {
                        if (socketId != sourceSocketId) {
                            client.handleUpdate(pixelUpdate);
                        }
                    }
                );
            }
        });
        // TODO need to sort out these priorities, in my water park
        this.queue.push(Priority.THREE, async () => {
            const trackedPicture.writeRaster
        });
    }

    // WARNING this will bind hte dirty
    private scheduleWrite(filename: string, dirty: boolean, raster?: Raster) {
        this.queue.push(Priority.THREE, async () => {
            if (raster && dirty) {
                await this.pictureAccessor.writeRaster(raster, filename)
            }
        });
    }
}
