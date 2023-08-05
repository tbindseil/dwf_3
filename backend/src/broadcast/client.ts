import { Update } from 'dwf-3-models-tjb';

export default abstract class Client {
    public abstract handleUpdate(update: Update, sourceSocketId: string): void;
    public abstract close(): void;
}
