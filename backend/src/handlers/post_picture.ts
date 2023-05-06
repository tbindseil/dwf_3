import {
    PostPictureInput,
    PostPictureOutput
} from 'dwf-3-models-tjb';
import API from './api';
import APIError from './api_error';
import IDB from '../db';
import PictureAccessor from '../picture_accessor/picture_accessor';


export class PostPicture extends API {
    private pictureAccessor: PictureAccessor;

    constructor (db: IDB, pictureAccessor: PictureAccessor) {
        super(db, 'POST', 'picture');

        this.pictureAccessor = pictureAccessor;
    }

    public getInput(body: any): PostPictureInput {
        // TODO schema validation, automatically, probably requires processing models into list of fields and making sure they are present here
        if ('name' in body && 'createdBy' in body) {
            return {
                name: body.name,
                createdBy: body.createdBy
            };
        } else {
            throw new APIError(400, 'name and created by must be provided, picture not created');
        }
    }

    public async process(db: IDB, input: PostPictureInput): Promise<PostPictureOutput> {
        const name = input.name;
        const createdBy = input.createdBy;
        const filesystem = this.pictureAccessor.getFileSystem();

        try {
            const filename = await this.pictureAccessor.createNewPicture(name, createdBy);

            const query = 'insert into picture (name, createdBy, filename, filesystem) values ($1, $2, $3, $4);'
            const params = [name, createdBy, filename, filesystem];

            await db.query(query, params);
        } catch (error) {
            console.error('post_picture and error is: ', error);
            throw new APIError(500, 'database issue, picture not created');
        }

        return {
            msg: 'picture successfully created'
        }
    }
}
