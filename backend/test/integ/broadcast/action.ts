import { PixelUpdate } from 'dwf-3-models-tjb';

import { Client } from './client';
import { PICTURE_WIDTH, PICTURE_HEIGHT } from './constants';

export interface Action {
    sentAt?: number;
    pixelUpdate: PixelUpdate;
    postActionWaitMS: number;
}

export const makeRandomAction = (
    clientID: string,
    filename: string
): Action => {
    const postActionWaitMS = Client.randomNumberBetweenZeroAnd(100);
    const pixelUpdate = new PixelUpdate({
        filename: filename,
        createdBy: clientID,
        x: Client.randomNumberBetweenZeroAnd(PICTURE_WIDTH),
        y: Client.randomNumberBetweenZeroAnd(PICTURE_HEIGHT),
        red: Client.randomNumberBetweenZeroAnd(255),
        green: Client.randomNumberBetweenZeroAnd(255),
        blue: Client.randomNumberBetweenZeroAnd(255),
    });

    return {
        postActionWaitMS,
        pixelUpdate,
    };
};
