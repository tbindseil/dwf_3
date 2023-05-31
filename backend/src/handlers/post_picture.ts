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

            // TODO could probably exercise thiw with an integ test
            //
            //
            //
            //
            // ok, i seem to be bumping into the issue of using `any` in certain places
            // like here
            // i would think its a good time to use the query builder thing, maybe
            // wrap it in a generic decorator, that will know how to select (everything (where everthing is
            //     all columns and all columns are all fields in the interface and all fields in the interface are camel to snake ified
            //
            // ,so what is a query builder in knex?
            // //TJTAG
            //
            //
            //
            //
            //

            //
            // whats actually going on?
            // transport types (GetPictureInput, PostPictureOutput, etc)
            // db types (Picture, Update (for example))
            //
            // does it need to be so generic?
            //
            // can i just do:
            // db.insertPicture(picture: Picture);
            // db.getPictures()
            // db.getfilename()
            //
            // that seems annoying
            // like, getpictures and getfilename are doing similar things
            // I think this actually adds code to test
            //
            // hmmm
            //
            // well maybe it could just be:
            // db.insertPicture(picture: Picture): void
            // db.getPictures(ids: string[]): (Picture[] | Picture) {
            //  returns individual picture if one id, or array if multiple
            // }
            //
            // ok, now anymore generic?
            //
            // db.insert<T>(t: T): void
            // db.get<T>(ids: string[]): (T[] | T)
            //
            // this sounds like objection

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
