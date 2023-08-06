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
    await broadcastMediator.addClient(joinPictureRequest.filename, socket);
    const joinPictureResponse = await pictureAccessor.getRaster(
        joinPictureRequest.filename
    ); // TODO this is happening way too much..
    socket.emit('join_picture_response', joinPictureResponse);
}

export function updateHandler(
    pixelUpdate: PixelUpdate,
    broadcastMediator: BroadcastMediator,
    sourceSocketId: string
): void {
    broadcastMediator.handleUpdate(pixelUpdate, sourceSocketId);
}

// TODO I think I am missing an unsubscribe
