import {
    PostPictureInput,
    PostPictureOutput
} from 'dwf-3-models-tjb';
import API from './api';
import APIError from './api_error';
import * as db from '../db';
import PictureAccessor from '../picture_accessor/picture_accessor';


export class PostPicture extends API {
    private pictureAccessor: PictureAccessor;

    constructor (pictureAccessor: PictureAccessor) {
        super('POST', 'picture');

        this.pictureAccessor = pictureAccessor;
    }

    public getInput(body: any): PostPictureInput {
        if ('name' in body && 'createdBy' in body) {
            return {
                name: body.name,
                createdBy: body.createdBy
            };
        } else {
            throw new APIError(400, 'name and created by must be provided, picture not created');
        }
    }

    public async process(input: PostPictureInput): Promise<PostPictureOutput> {
        const name = input.name;
        const createdBy = input.createdBy;
        const createdAt = new Date().toString();

        const filename = `${name}_${createdBy}_${createdAt}.png`;

        const query = 'insert into picture (name) values ($1);'
        const params = [name];

        try {
            this.pictureAccessor.createNewPicture(filename);
            await db.query(query, params);
        } catch (error) {
            throw new APIError(500, 'database issue, picture not created');
        }

        return {
            msg: 'picture successfully created'
        }
    }
}
