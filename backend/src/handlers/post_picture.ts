import {
    Picture,
    PostPictureInput,
    PostPictureOutput,
    _schema,
} from 'dwf-3-models-tjb';
import API from './api';
import PictureAccessor from '../picture_accessor/picture_accessor';
import { ValidateFunction } from 'ajv';
import { Knex } from 'knex';

export class PostPicture extends API<PostPictureInput, PostPictureOutput> {
    private pictureAccessor: PictureAccessor;

    public provideInputValidationSchema(): ValidateFunction {
        const ret = this.ajv.compile(_schema);
        return ret;
    }

    constructor(pictureAccessor: PictureAccessor) {
        super();
        this.pictureAccessor = pictureAccessor;
    }

    public async process(
        input: PostPictureInput,
        knex: Knex
    ): Promise<PostPictureOutput> {
        const name = input.name;
        const createdBy = input.createdBy;

        const filesystem = this.pictureAccessor.getFileSystem();
        const filename = await this.pictureAccessor.createNewPicture(
            name,
            createdBy,
            input.width,
            input.height
        );

        await Picture.query(knex).insert({
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
