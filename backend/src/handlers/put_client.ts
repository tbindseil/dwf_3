import {
    PutClientInput,
    PutClientOutput
} from 'dwf-3-models-tjb';
import API from './api';


export class PutClient extends API {
    constructor() {
        super('PUT', 'client')
    }

    public get_input(req: any): PutClientInput {
        console.log('PutClient.get_input');
        req;
        return {};
    }

    public process(input: PutClientInput): PutClientOutput {
        console.log('PutClient.process');
        input;
        return {
            msg: 'client added to picture'
        }
    }
}
