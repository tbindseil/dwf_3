import {
    GetPicturesInput,
    GetPicturesOutput
} from 'dwf-3-models-tjb';
import API from './api';


export class GetPictures extends API {
    constructor() {
        super('GET', 'pictures');
    }

    public get_input(req: any): GetPicturesInput {
        console.log('GetPictures.get_input');
        req;
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
