import {
    JoinPictureRequest,
    PixelUpdate,
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData,
} from 'dwf-3-models-tjb';
import BroadcastMediator from './broadcast/broadcast_mediator';
import PictureAccessor from './picture_accessor/picture_accessor';
import { Socket } from 'socket.io';

export async function joinPictureRequestHandler(
    joinPictureRequest: JoinPictureRequest,
    broadcastMediator: BroadcastMediator,
    pictureAccessor: PictureAccessor,
    socket: Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >
): Promise<void> {
    // whoa, gonna have to return the raster from the broadcast mediator
    // which will involve coordination with the only known raster amongst the clients
    // which is in the pictureSyncClient.  so that will need a way to ...
    // or, the broadcast client keeps a new client that is in charge of this
    await broadcastMediator.addClient(joinPictureRequest.filename, socket);
}

export function updateHandler(
    pixelUpdate: PixelUpdate,
    broadcastMediator: BroadcastMediator,
    sourceSocketId: string
): void {
    broadcastMediator.handleUpdate(pixelUpdate, sourceSocketId);
}
