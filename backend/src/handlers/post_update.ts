import {
    PostUpdateInput,
    PostUpdateOutput
} from 'dwf-3-models-tjb';
import API from './api';


export class PostUpdate extends API {
    constructor() {
        super('POST', 'update');
    }

    public async get_input(req: any): Promise<PostUpdateInput> {
        console.log('PostUpdate.get_input');
        req;
        return {};
    }

    public async process(input: PostUpdateInput): Promise<PostUpdateOutput> {
        console.log('PostUpdate.process');
        input;
        return {
            msg: 'received udpate'
        }
    }
}
