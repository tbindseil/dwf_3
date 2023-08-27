import { Update } from '../updates/update';

export interface ClientToServerEvents {
    join_picture_request: (joinPictureRequest: JoinPictureRequest) => void;
    leave_picture_request: (leavePictureRequest: LeavePictureRequest) => void;
    client_to_server_udpate: (update: Update) => void;
    unsubscribe: (filename: string) => void;
}

export interface ServerToClientEvents {
    join_picture_response: (joinPictureResponse: JoinPictureResponse) => void;
    leave_picture_response: () => void;
    server_to_client_update: (update: Update) => void;
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
