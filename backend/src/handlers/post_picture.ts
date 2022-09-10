import {
    PostPictureInput,
    PostPictureOutput
} from 'dwf-3-models-tjb';
import API from './api';
import APIError from './api_error';
import * as db from '../db';


export class PostPicture extends API {
    constructor () {
        super('POST', 'picture');
    }

    public getInput(body: any): PostPictureInput {
        if ('name' in body) {
            return {
                name: body.name
            };
        } else {
            throw new APIError(400, 'name not provided, picture not created'); // could probably be moved to a better place
        }
    }

    public async process(input: PostPictureInput): Promise<PostPictureOutput> {
        const name = input.name;

        const query = `insert into test_auto_increment (name) values ($1);`
        const params = [name];

        try {
            await db.query(query, params);
        } catch (error) {
            throw new APIError(500, 'database issue, picture not created'); // could probably be moved to some other place
        }

        return {
            msg: 'picture successfully created'
        }
    }
}
