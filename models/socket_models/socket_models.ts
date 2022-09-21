export interface ClientToServerEvents {
    picture_request: (pictureRequest: PictureRequest) => void;
}

export interface ServerToClientEvents {
    picture_response: (pictureResponse: PictureResponse) => void;
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
