import {
    PostPictureInput,
    PostPictureOutput
} from 'dwf-3-models-tjb';
import API from './api';


export class PostPicture extends API {
    constructor () {
        super('POST', 'picture');
    }

    public get_input(req: any): PostPictureInput {
        console.log('PostPicture.get_input');
        req;
        return {};
    }

    public process(input: PostPictureInput): PostPictureOutput {
        console.log('PostPicture.process');
        input;
        return {
            msg: 'picture created'
        }
    }
}
