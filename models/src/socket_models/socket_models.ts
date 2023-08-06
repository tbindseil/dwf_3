import { PixelUpdate } from '../updates/pixel_update';

export interface ClientToServerEvents {
    join_picture_request: (pictureRequest: JoinPictureRequest) => void;
    client_to_server_udpate: (pixelUpdate: PixelUpdate) => void;
    unsubscribe: (filename: string) => void;
}

export interface ServerToClientEvents {
    join_picture_response: (joinPictureResponse: JoinPictureResponse) => void;
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

export interface JoinPictureRequest {
    filename: string;
}

export interface JoinPictureResponse {
    width: number;
    height: number;
    data: ArrayBuffer;
}
