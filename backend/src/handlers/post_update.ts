import {
    PostUpdateInput,
    PostUpdateOutput
} from 'dwf-3-models-tjb';
import IDB from '../db';
import API from './api';

// TODO what is this?
export class PostUpdate extends API {
    constructor(db: IDB) {
        super(db, 'POST', 'update');
    }

    // public getInput(body: any): PostUpdateInput {
    public getInput(body: any): any {
        console.log('PostUpdate.getInput');
        body;
        // return {body.};
    }

    public async process(db: IDB, input: PostUpdateInput): Promise<PostUpdateOutput> {
        console.log('PostUpdate.process');
        db;
        input;
        return {
            msg: 'received udpate'
        }
    }
}
