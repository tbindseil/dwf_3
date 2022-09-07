import {
    GetPicturesInput,
    GetPicturesOutput
} from 'dwf-3-models-tjb';
import API from './api';
// import * as db from '../db';


export class GetPictures extends API {
    constructor() {
        super('GET', 'pictures');
    }

    public async get_input(req: any): Promise<GetPicturesInput> {
        console.log('GetPictures.get_input');
        req;
        return {};
    }

    public async process(input: GetPicturesInput): Promise<GetPicturesOutput> {
        console.log('GetPictures.process');
        input;
        return {
            msg: 'all pictures'
        }
    }
}
