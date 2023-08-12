import Client from './client';
import { Update } from 'dwf-3-models-tjb';

// needs to:
// 1. send picture at a known point
// 2. save and send any updates that happen while that is happening
// 3. once complete, signal to the broadcast client that it can start sending
export default class ClientInitalizationClient extends Client {
    public handleUpdate(update: Update): void {
        console.log('here');
    }

    public close(): void {
        console.log('close');
    }
}
