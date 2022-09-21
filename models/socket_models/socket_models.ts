export interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
    picture_request: (pictureRequest: PictureRequest) => void;
}

export interface ClientToServerEvents {
    hello: () => void;
    picture_response: (pictureBuffer: PictureResponse) => void;
}

export interface InterServerEvents {
    ping: () => void;
}

// TODO do i need this?
export interface SocketData {
    name: string;
    age: number;
}

export interface PictureRequest {
    filename: string
}

export interface PictureResponse {
    width: number,
    height: number,
    data: Buffer
}
