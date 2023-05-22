import { PostPictureInput, PostPictureOutput } from 'dwf-3-models-tjb';
import API from './api';
import APIError from './api_error';
import IDB from '../db';
import PictureAccessor from '../picture_accessor/picture_accessor';
import { NextFunction } from 'express';

export class PostPicture extends API<PostPictureInput, PostPictureOutput> {
    private pictureAccessor: PictureAccessor;

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
        const filesystem = this.pictureAccessor.getFileSystem();

        try {
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
