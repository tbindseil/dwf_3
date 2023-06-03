import { PostUpdateInput, PostUpdateOutput, _schema } from 'dwf-3-models-tjb';
import IDB from '../db';
import API from './api';
import { NextFunction } from 'express';
import { ValidateFunction } from 'ajv';

// TODO what is this?
export class PostUpdate extends API<PostUpdateInput, PostUpdateOutput> {
    constructor(db: IDB) {
        super(db, 'POST');
    }

    public provideInputValidationSchema(): ValidateFunction {
        return this.ajv.compile(_schema.GetPictureInput);
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
