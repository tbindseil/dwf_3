import {
    DeleteClientInput,
    DeleteClientOutput
} from 'dwf-3-models-tjb';
import API from './api';


export class DeleteClient extends API {
    constructor() {
        super('DELETE', 'client');
    }

    public get_input(req: any): DeleteClientInput {
        console.log('DeleteClient.get_input');
        req;
        return {};
    }

    public process(input: DeleteClientInput): DeleteClientOutput {
        console.log('DeleteClient.process');
        input;
        return {
            msg: 'client removed from picture'
        }
    }
}
