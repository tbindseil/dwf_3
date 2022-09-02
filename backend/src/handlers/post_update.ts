import {
    PostUpdateInput,
    PostUpdateOutput
} from 'dwf-3-models-tjb';
import API from './api';


export class PostUpdate extends API {
    constructor() {
        super('POST', 'update');
    }

    public get_input(req: any): PostUpdateInput {
        console.log('PostUpdate.get_input');
        req;
        return {};
    }

    public process(input: PostUpdateInput): PostUpdateOutput {
        console.log('PostUpdate.process');
        input;
        return {
            msg: 'received udpate'
        }
    }
}
