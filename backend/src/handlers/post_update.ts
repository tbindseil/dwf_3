import {
    PostUpdateInput,
    PostUpdateOutput
} from 'dwf-3-models-tjb';
import API from './api';


export class PostUpdate extends API {
    constructor() {
        super('POST', 'update');
    }

    public getInput(body: any): PostUpdateInput {
        console.log('PostUpdate.getInput');
        body;
        return {body.};
    }

    public async process(input: PostUpdateInput): Promise<PostUpdateOutput> {
        console.log('PostUpdate.process');
        input;
        return {
            msg: 'received udpate'
        }
    }
}
