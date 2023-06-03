import { PostUpdateInput, PostUpdateOutput, _schema } from 'dwf-3-models-tjb';
import API from './api';
import { ValidateFunction } from 'ajv';

// TODO what is this?
export class PostUpdate extends API<PostUpdateInput, PostUpdateOutput> {
    constructor() {
        super();
    }

    public provideInputValidationSchema(): ValidateFunction {
        return this.ajv.compile(_schema.GetPictureInput);
    }

    public async process(input: PostUpdateInput): Promise<PostUpdateOutput> {
        console.log('PostUpdate.process');
        input;
        return {
            msg: 'received udpate',
        };
    }
}
