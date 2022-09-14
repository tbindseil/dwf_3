import Client from './client';

export default class PictureSyncClient extends Client {
    private readonly pictureId;

    constructor(pictureId: string) {
        super();

        this.pictureId = pictureId;
    }
}
