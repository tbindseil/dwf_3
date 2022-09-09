import {
    DeleteClientInput,
    DeleteClientOutput
} from 'dwf-3-models-tjb';
import API from './api';


export class DeleteClient extends API {
    constructor() {
        super('DELETE', 'client');
    }

    public getInput(body: any): DeleteClientInput {
        console.log('DeleteClient.getInput');
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
