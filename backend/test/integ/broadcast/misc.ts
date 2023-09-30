export const NUM_ROUNDS = 5;
export const MAX_CLIENTS_PER_PICTURE = 20;
export const MAX_CLIENT_ACTIONS = 20;
export const MAX_WAIT_MS = 500;
export const PICTURE_WIDTH = 80;
export const PICTURE_HEIGHT = 100;
export const MAX_COLOR_VALUE = 255;

export const randomNumberBetweenZeroAnd = (high: number): number => {
    return Math.floor(high * Math.random());
};

export const delay = async (ms: number) => {
    await new Promise((r) => setTimeout(r, ms));
};
