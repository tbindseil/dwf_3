import { Update } from 'dwf-3-models-tjb';

export default class Client {

    public handleUpdate(update: Update, sourceSocketId: string): void {
        update;
        sourceSocketId;
        throw new Error('Client.handleUpdate not implemented');
    }

    public forcePictureWrite(): void {
        throw new Error('Client.forcePictureWrite not implemented');
    }
}
