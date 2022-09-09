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

    public async get_input(body: any): Promise<PostPictureInput> {
        return {
            name: body.name
        };
    }

    public async process(input: PostPictureInput): Promise<PostPictureOutput> {
        const name = input.name;

        if (!name) {
            throw new APIError(400, 'name not provided, picture not created');
        }

        const query = `insert into test_auto_increment (name) values ($1);`
        const params = [name];

        try {
            await db.query(query, params);
        } catch (error) {
            throw new APIError(500, 'database issue, picture not created');
        }

        const new_picture = {
            name: 'todo actually get pic from result'
        };

        return {
            msg: `picture successfully created: ${JSON.stringify(new_picture)}`
        }
    }
}
