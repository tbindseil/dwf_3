export default class PictureAccessor {
    public async createNewPicture(pictureName: string, createdBy: string): Promise<string> {
        pictureName;
        createdBy;
        throw new Error('PictureAccessor.createNewPicture not implemented');
    }

    public getFileSystem(): string {
        throw new Error('PictureAccessor.createNewPicture not implemented');
    }

    public async getPicture(filename: string): Promise<Buffer> {
        filename;
        throw new Error('PictureAccessor.getPicture not implemented');
    }
}
