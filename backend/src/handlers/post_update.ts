import { PostUpdateInput, PostUpdateOutput } from 'dwf-3-models-tjb';
import IDB from '../db';
import API from './api';
import { NextFunction } from 'express';

// TODO what is this?
export class PostUpdate extends API<PostUpdateInput, PostUpdateOutput> {
    constructor(db: IDB) {
        super(db, 'POST', 'update');
    }

    public async process(
        db: IDB,
        input: PostUpdateInput,
        next: NextFunction
    ): Promise<PostUpdateOutput> {
        console.log('PostUpdate.process');
        db;
        input;
        next;
        return {
            msg: 'received udpate',
        };
    }
}
