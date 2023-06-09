import { PostUpdateInput, PostUpdateOutput, _schema } from 'dwf-3-models-tjb';
import API from './api';
import { ValidateFunction } from 'ajv';
import { Knex } from 'knex';

// TODO what is this?
export class PostUpdate extends API<PostUpdateInput, PostUpdateOutput> {
    constructor() {
        super();
    }

    public provideInputValidationSchema(): ValidateFunction {
        return this.ajv.compile(_schema.GetPictureInput);
    }

    public async process(
        input: PostUpdateInput,
        knex: Knex
    ): Promise<PostUpdateOutput> {
        console.log('PostUpdate.process');
        input;
        knex;
        return {
            msg: 'received udpate',
        };
    }
}
