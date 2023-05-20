import { Socket } from 'socket.io';
import {
    ServerToClientEvents,
    ClientToServerEvents,
    InterServerEvents,
    SocketData,
    PictureRequest,
    PixelUpdate,
} from 'dwf-3-models-tjb';
import BroadcastMediator from './broadcast/broadcast_mediator';
import PictureAccessor from './picture_accessor/picture_accessor';

export async function pictureRequestHandler(
    pictureRequest: PictureRequest,
    broadcastMediator: BroadcastMediator,
    pictureAccessor: PictureAccessor,
    socket: Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >
): Promise<void> {
    await broadcastMediator.addClient(pictureRequest.filename, socket);
    const pictureResponse = await pictureAccessor.getRaster(
        pictureRequest.filename
    ); // TODO this is happening way too much..
    socket.emit('picture_response', pictureResponse);
}

export function updateHandler(
    pixelUpdate: PixelUpdate,
    broadcastMediator: BroadcastMediator,
    sourceSocketId: string
): void {
    broadcastMediator.handleUpdate(pixelUpdate, sourceSocketId);
}
