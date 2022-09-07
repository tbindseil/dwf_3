import {
    PutClientInput,
    PutClientOutput
} from 'dwf-3-models-tjb';
import API from './api';


export class PutClient extends API {
    constructor() {
        super('PUT', 'client')
    }

    public async get_input(body: any): Promise<PutClientInput> {
        console.log('PutClient.get_input');
        body;
        return {};
    }

    public async process(input: PutClientInput): Promise<PutClientOutput> {
        console.log('PutClient.process');
        input;
        return {
            msg: 'client added to picture'
        }
    }
}
