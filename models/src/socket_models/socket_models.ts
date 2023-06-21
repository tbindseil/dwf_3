import { Server, Socket } from 'socket.io';
import { PixelUpdate } from '../updates/pixel_update';

export interface ClientToServerEvents {
    picture_request: (pictureRequest: PictureRequest) => void;
    client_to_server_udpate: (pixelUpdate: PixelUpdate) => void;
    unsubscribe: (filename: string) => void;
}

export interface ServerToClientEvents {
    picture_response: (pictureResponse: PictureResponse) => void;
    server_to_client_update: (pixelUpdate: PixelUpdate) => void;
}

export interface InterServerEvents {
    ping: () => void;
}

// TODO do i need this?
export interface SocketData {
    name: string;
    age: number;
}

export interface DWFServer
    extends Server<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    > {}

export interface DWFSocket
    extends Socket<
        ServerToClientEvents,
        ClientToServerEvents,
        InterServerEvents,
        SocketData
    > {}

//export type DWFServer = Server<
//    ClientToServerEvents,
//    ServerToClientEvents,
//    InterServerEvents,
//    SocketData
//>

// see docs, but can utilize namespace specific event maps
// export type DWFSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export interface PictureRequest {
    filename: string;
}

export interface PictureResponse {
    width: number;
    height: number;
    data: ArrayBuffer;
}
