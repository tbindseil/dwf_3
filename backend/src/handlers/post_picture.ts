import { PostPictureInput, PostPictureOutput, _schema } from 'dwf-3-models-tjb';
import API from './api';
import APIError from './api_error';
import IDB from '../db';
import PictureAccessor from '../picture_accessor/picture_accessor';
import { NextFunction } from 'express';
import { ValidateFunction } from 'ajv';

export class PostPicture extends API<PostPictureInput, PostPictureOutput> {
    private pictureAccessor: PictureAccessor;

    public provideInputValidationSchema(): ValidateFunction {
        return this.ajv.compile(_schema.GetPictureInput);
    }

    constructor(db: IDB, pictureAccessor: PictureAccessor) {
        super(db, 'POST', 'picture');

        this.pictureAccessor = pictureAccessor;
    }

    // dont need to validate upon extraction if i can garauntee that they will be there
    // so add a middleware
    // this is where i have to do the thing from work
    // i think the way its done is that
    // before compilation, all models (maybe annotate or something)
    // go through processor that outputs necessary keys and types mapped  to (maybe from) a path
    // then, save that and reference with a custom middleware prior to routing.
    // if things arent right, throw 400, 'invalid input') there
    // public function(keys: string[], input: PostPictureInput):

    public async process(
        db: IDB,
        input: PostPictureInput,
        next: NextFunction
    ): Promise<PostPictureOutput> {
        next;

        const name = input.name;
        const createdBy = input.createdBy;

        try {
            const filesystem = this.pictureAccessor.getFileSystem();
            const filename = await this.pictureAccessor.createNewPicture(
                name,
                createdBy
            );

            const query =
                'insert into picture (name, createdBy, filename, filesystem) values (?, ?, ?, ?);';
            const params = [name, createdBy, filename, filesystem];

            await db.query(query, params);
        } catch (error) {
            console.error('post_picture and error is: ', error);
            throw new APIError(500, 'database issue, picture not created');
        }

        return {
            msg: 'picture successfully created',
        };
    }
}
