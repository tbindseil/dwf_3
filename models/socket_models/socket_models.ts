import { PixelUpdate } from '../updates/pixel_update';

export interface ClientToServerEvents {
    picture_request: (pictureRequest: PictureRequest) => void;
    client_to_server_udpate: (pixelUpdate: PixelUpdate) => void;
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

export interface PictureRequest {
    filename: string
}

export interface PictureResponse {
    width: number,
    height: number,
    data: ArrayBuffer
}
