import { Namespace, Server, ServerOptions, Socket } from 'socket.io';
import { PixelUpdate } from '../updates/pixel_update';
import { Client } from 'socket.io/dist/client';
import http from 'http';

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

// the below seems pretty excessive, but I wasn't able to do type alias because of an issue instantiating
//export class DWFServer extends Server<
//    ClientToServerEvents,
//    ServerToClientEvents,
//    InterServerEvents,
//    SocketData
//> {
//    constructor(srv: http.Server, opts?: Partial<ServerOptions> | undefined) {
//        console.log('@@ TJTAG @@');
//        super(srv, opts);
//    }
//}
//
//export class DWFSocket extends Socket<
//    ClientToServerEvents,
//    ServerToClientEvents,
//    InterServerEvents,
//    SocketData
//> {
//    constructor(
//        namespace: Namespace<
//            ClientToServerEvents,
//            ServerToClientEvents,
//            InterServerEvents,
//            any
//        >,
//        client: Client<
//            ClientToServerEvents,
//            ServerToClientEvents,
//            InterServerEvents,
//            any
//        >,
//        auth: object
//    ) {
//        super(namespace, client, auth);
//    }
//}

//export interface DWFServer
//    extends Server<
//        ClientToServerEvents,
//        ServerToClientEvents,
//        InterServerEvents,
//        SocketData
//    > {}
//
//export interface DWFSocket
//    extends Socket<
//        ServerToClientEvents,
//        ClientToServerEvents,
//        InterServerEvents,
//        SocketData
//    > {}

//export type DWFServer = Server<
//    ClientToServerEvents,
//    ServerToClientEvents,
//    InterServerEvents,
//    SocketData
//>;
//
//export type DWFSocket = Socket<
//    ServerToClientEvents,
//    ClientToServerEvents,
//    InterServerEvents,
//    SocketData
//>;

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
