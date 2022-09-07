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

    public async get_input(req: any): Promise<PostPictureInput> {
        console.log('PostPicture.get_input');
        let body = '';
        await req.on('data', (chunk: any) => {
            body += chunk;
        });
        const body_obj = JSON.parse(body);

        /* req.on('data', (chunk: any) => {
            body += chunk;
        });
        req.on('end', () => {
            console.log(`in callback, body is: ${body}`);
        });
        console.log(`after callback, body is: ${body}`);

        const body_obj = JSON.parse(body);*/

        return {
            name: body_obj.name
        }
    }

    public process(input: PostPictureInput): PostPictureOutput {
        console.log('PostPicture.process');
        const name = input.name;

        if (!name) {
            return {
                msg: 'name not provided, picture not created'
            };
        }

        const query = `insert into test_auto_increment (name) values ($1);`
        const params = [name];

        let success_obj = {
            success: false
        }

        db.query(query, params, (err: any, result: any) => {
            this.processQueryResult(err, result, success_obj);
        });

        // could probably be encasulated in the API class
        // honestly just needs more thought I think
        return {
            msg: `picture ${success_obj.success ? 'successfully' : 'not'} created: ${JSON.stringify}`
        }
    }
}
