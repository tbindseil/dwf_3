import {
    Picture,
    PostPictureInput,
    PostPictureOutput,
    _schema,
} from 'dwf-3-models-tjb';
import API from './api';
import PictureAccessor from '../picture_accessor/picture_accessor';
import { ValidateFunction } from 'ajv';

export class PostPicture extends API<PostPictureInput, PostPictureOutput> {
    private pictureAccessor: PictureAccessor;

    public provideInputValidationSchema(): ValidateFunction {
        return this.ajv.compile(_schema.GetPictureInput);
    }

    constructor(pictureAccessor: PictureAccessor) {
        super();
        this.pictureAccessor = pictureAccessor;
    }

    public async process(input: PostPictureInput): Promise<PostPictureOutput> {
        const name = input.name;
        const createdBy = input.createdBy;

        const filesystem = this.pictureAccessor.getFileSystem();
        const filename = await this.pictureAccessor.createNewPicture(
            name,
            createdBy
        );

        Picture.query().insert({
            name: name,
            createdBy: createdBy,
            filename: filename,
            filesystem: filesystem,
        });

        return {
            msg: 'picture successfully created',
        };
    }
}
