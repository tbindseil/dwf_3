import { Action, makeRandomAction } from './action';
import { Client } from './client';

import { MAX_WAIT_MS } from './constants';

export interface ClientScript {
    clientID: string;
    filename: string;
    initialWait: number;
    actions: Action[];
}

export const makeRandomClientScript = (
    filename: string,
    clientID: string,
    numActions: number
): ClientScript => {
    const initialWait = Client.randomNumberBetweenZeroAnd(MAX_WAIT_MS);
    const actions: Action[] = [];
    for (let i = 0; i < numActions; ++i) {
        actions.push(makeRandomAction(clientID, filename));
    }

    return {
        clientID,
        filename,
        initialWait,
        actions,
    };
};
