import { PixelUpdateProps } from 'dwf-3-models-tjb';

import { Client } from './client';
import { PICTURE_WIDTH, PICTURE_HEIGHT } from './constants';

type UnsentPixelUpdate = Omit<PixelUpdateProps, 'filename' | 'createdBy'>;

export interface Action {
    sentAt?: number;
    unsentPixelUpdate: UnsentPixelUpdate;
    postActionWaitMS: number;
}

export const makeRandomAction = (): Action => {
    const postActionWaitMS = Client.randomNumberBetweenZeroAnd(100);
    const unsentPixelUpdate: UnsentPixelUpdate = {
        x: Client.randomNumberBetweenZeroAnd(PICTURE_WIDTH),
        y: Client.randomNumberBetweenZeroAnd(PICTURE_HEIGHT),
        red: Client.randomNumberBetweenZeroAnd(255),
        green: Client.randomNumberBetweenZeroAnd(255),
        blue: Client.randomNumberBetweenZeroAnd(255),
    };

    return {
        postActionWaitMS,
        unsentPixelUpdate,
    };
};
