import { Socket } from 'socket.io';
import {
    ServerToClientEvents,
    ClientToServerEvents,
    InterServerEvents,
    SocketData,
    PictureRequest
} from 'dwf-3-models-tjb';
import BroadcastMediator from './broadcast/broadcast_mediator';
import PictureAccessor from './picture_accessor/picture_accessor';

export async function pictureRequestHandler(pictureRequest: PictureRequest,
                                            broadcastMediator: BroadcastMediator,
                                            pictureAccessor: PictureAccessor,
                                            socket: Socket<ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData>): Promise<void> {
    broadcastMediator.addClient(pictureRequest.filename, socket);
    const pictureBuffer = await pictureAccessor.getRaster(pictureRequest.filename);
    socket.emit('picture_response', pictureBuffer);
}
