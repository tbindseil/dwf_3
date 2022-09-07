import {
    PostPictureInput,
    PostPictureOutput
} from 'dwf-3-models-tjb';
import API from './api';
import * as db from '../db';


export class PostPicture extends API {
    constructor () {
        super('POST', 'picture');
    }

    // so, I could move all of the buffer shit into api, then, this would remain unchanged except it would have a tighter interface with the json.parse done in the parent class
    public async get_input(req: any): Promise<PostPictureInput> {
        const buffers: Uint8Array[] = [];

        for await (const chunk of req) {
            buffers.push(chunk);
        }

        const data = Buffer.concat(buffers).toString();
        const body = JSON.parse(data);
        return {
            name: body.name
        };
    }

    public async process(input: PostPictureInput): Promise<PostPictureOutput> {
        const name = input.name;

        if (!name) {
            return {
                msg: 'name not provided, picture not created'
            };
        }

        const query = `insert into test_auto_increment (name) values ($1);`
        const params = [name];

        try {
            await db.query(query, params);
        } catch (error) {
            // could probably be encasulated in the API class
            // honestly just needs more thought I think
            // throw error;
            return {
                msg: 'picture not created'
            }
        }

        const new_picture = {
            name: 'todo actually get pic from result'
        };

        return {
            msg: `picture successfully created: ${JSON.stringify(new_picture)}`
        }
    }
}
