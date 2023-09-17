import { Action, makeRandomAction } from './action';

import { MAX_WAIT_MS, randomNumberBetweenZeroAnd } from './misc';

export interface ClientScript {
    initialWait: number;
    actions: Action[];
}

export const makeRandomClientScript = (numActions: number): ClientScript => {
    const initialWait = randomNumberBetweenZeroAnd(MAX_WAIT_MS);
    const actions: Action[] = [];
    for (let i = 0; i < numActions; ++i) {
        actions.push(makeRandomAction());
    }

    return {
        initialWait,
        actions,
    };
};
