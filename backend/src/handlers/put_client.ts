import {
    PutClientInput,
    PutClientOutput
} from 'dwf-3-models-tjb';
import API from './api';
import BroadcastMediator from '../broadcast/broadcast_mediator';


export class PutClient extends API {
    private readonly broadcastMediator: BroadcastMediator;

    constructor(broadcastMediator: BroadcastMediator) {
        super('PUT', 'client');

        this.broadcastMediator = broadcastMediator;
    }

    public getInput(body: any): PutClientInput {
        return {
            ipAddress: body.ipAddress,
            pictureId: body.pictureId
        };
    }

    public async process(input: PutClientInput): Promise<PutClientOutput> {
        this.broadcastMediator.addClient(input.pictureId, input.ipAddress);
        // this will need to return the picture at the time that the client registration takes place
        // this does not necessarily eliminate the need for get picture because that can happen independently of registration
        return {
            msg: 'client added to picture'
        }
    }
}
