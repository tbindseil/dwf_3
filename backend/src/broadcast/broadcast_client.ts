import Client from './client';

export default class BroadcastClient extends Client {
    constructor(ipAddress: string) {
        super();
    }

    public handleUpdate(update: any): void {
        // this one's easier, just send it to the socket
    }
}
