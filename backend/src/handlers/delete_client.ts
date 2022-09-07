import {
    DeleteClientInput,
    DeleteClientOutput
} from 'dwf-3-models-tjb';
import API from './api';


export class DeleteClient extends API {
    constructor() {
        super('DELETE', 'client');
    }

    public async get_input(body: any): Promise<DeleteClientInput> {
        console.log('DeleteClient.get_input');
        body;
        return {};
    }

    public async process(input: DeleteClientInput): Promise<DeleteClientOutput> {
        console.log('DeleteClient.process');
        input;
        return {
            msg: 'client removed from picture'
        }
    }
}
