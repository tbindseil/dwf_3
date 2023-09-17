import { PixelUpdateProps } from 'dwf-3-models-tjb';

import {
    PICTURE_WIDTH,
    PICTURE_HEIGHT,
    randomNumberBetweenZeroAnd,
} from './misc';

type UnsentPixelUpdate = Omit<PixelUpdateProps, 'filename' | 'createdBy'>;

export interface Action {
    sentAt?: number;
    unsentPixelUpdate: UnsentPixelUpdate;
    postActionWaitMS: number;
}

export const makeRandomAction = (): Action => {
    const postActionWaitMS = randomNumberBetweenZeroAnd(100);
    const unsentPixelUpdate: UnsentPixelUpdate = {
        x: randomNumberBetweenZeroAnd(PICTURE_WIDTH),
        y: randomNumberBetweenZeroAnd(PICTURE_HEIGHT),
        red: randomNumberBetweenZeroAnd(255),
        green: randomNumberBetweenZeroAnd(255),
        blue: randomNumberBetweenZeroAnd(255),
    };

    return {
        postActionWaitMS,
        unsentPixelUpdate,
    };
};
