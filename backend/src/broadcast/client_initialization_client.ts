import {Socket} from 'socket.io';
import Client from './client';
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData, Update } from 'dwf-3-models-tjb';
import PictureAccessor from '../picture_accessor/picture_accessor';

// needs to:
// 1. send picture at a known point
// 2. save and send any updates that happen while that is happening
// 3. once complete, signal to the broadcast client that it can start sending
export default class ClientInitalizationClient extends Client {
    private readonly pictureAccessor: PictureAccessor;
    private readonly socket: Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >;

    constructor(
        pictureAccessor: PictureAccessor,
        socket: Socket<
            ClientToServerEvents,
            ServerToClientEvents,
            InterServerEvents,
            SocketData
        >,
    ) {
        super();
        this.pictureAccessor = pictureAccessor;
        this.socket = socket;

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

    public handleUpdate(update: Update): void {
        console.log('here');
    }

    public close(): void {
        console.log('close');
    }
}
