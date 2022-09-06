import {
    GetPicturesInput,
    GetPicturesOutput
} from 'dwf-3-models-tjb';
import API from './api';
import * as db from '../db';


export class GetPictures extends API {
    constructor() {
        super('GET', 'pictures');
    }

    public get_input(req: any): GetPicturesInput {
        console.log('GetPictures.get_input');
        req;

        // temporary, test out db connection
        const query = 'SELECT * from test_auto_increment where id = $1';
        const params = ['1'];
        db.query(query, params, (err: any, result: any) => {
            console.log(`err is ${err}`);
            console.log(`result is ${JSON.stringify(result)}`);
        });

        return {};
    }

    public process(input: GetPicturesInput): GetPicturesOutput {
        console.log('GetPictures.process');
        input;
        return {
            msg: 'all pictures'
        }
    }
}
