import Client from './client';
import { Update } from 'dwf-3-models-tjb';

export default class BroadcastClient extends Client {
    constructor(ipAddress: string) {
        super();
    }

    public handleUpdate(update: Update): void {
        // this one's easier, just send it to the socket
    }
}
