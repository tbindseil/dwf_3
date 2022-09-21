import {
    PutClientInput,
    PutClientOutput
} from 'dwf-3-models-tjb';
import API from './api';
import APIError from './api_error';
import BroadcastMediator from '../broadcast/broadcast_mediator';
import * as db from '../db';


export class PutClient extends API {
    private readonly broadcastMediator: BroadcastMediator;

    constructor(broadcastMediator: BroadcastMediator) {
        super('PUT', 'client');

        this.broadcastMediator = broadcastMediator;
    }

    public getInput(body: any): PutClientInput {
        if ('filename' in body) {
            return {
                filename: body.filename
            };
        } else {
            throw new APIError(400, 'filename must be provided, client not registered');
        }
    }

    // this just happens upon the on connection function of the socket server
    // then pass the socket to the broadcast client

    // this will need to return the picture at the time that the client registration takes place
    // this does not necessarily eliminate the need for get picture because that can happen independently of registration
    public async process(input: PutClientInput): Promise<PutClientOutput> {
        /*
        let filename: string;
        try {
            const query = 'select filename from picture where id=$1;';
            const params = [input.filename];

            const result = await db.query(query, params);
            filename = result.rows[0].filename;
        } catch (error) {
            throw new APIError(500, 'database issue, client not registered');
        }
        */

        // this.broadcastMediator.addClient(input.filename);
        return {
            msg: 'client added to picture',
            buffer: 'buffer'
        }
    }
}
