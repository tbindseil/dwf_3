import { PutClientInput } from '../put_client';

export interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
    picture_request: (pictureRequest: PutClientInput) => void;
}

export interface ClientToServerEvents {
    hello: () => void;
    picture_response: (pictureBuffer: Uint8Array) => void;
}

export interface InterServerEvents {
    ping: () => void;
}

export interface SocketData {
    name: string;
    age: number;
}
