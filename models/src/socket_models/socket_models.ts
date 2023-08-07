import { PixelUpdate } from '../updates/pixel_update';

export interface ClientToServerEvents {
    join_picture_request: (joinPictureRequest: JoinPictureRequest) => void;
    leave_picture_request: (leavePictureRequest: LeavePictureRequest) => void;
    client_to_server_udpate: (pixelUpdate: PixelUpdate) => void;
    unsubscribe: (filename: string) => void;
}

export interface ServerToClientEvents {
    join_picture_response: (joinPictureResponse: JoinPictureResponse) => void;
    leave_picture_response: () => void;
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

export interface LeavePictureRequest {
    filename: string;
}

export interface JoinPictureResponse {
    width: number;
    height: number;
    data: ArrayBuffer;
}

// TJTAG TODO next is LeavePictureRequest/Response
// may be a good time to switch to using id instead of filename
