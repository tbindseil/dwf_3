import { NextFunction } from 'express';
import ajv from 'ajv';
import { Knex } from 'knex';

export const mockNext = jest.fn() as unknown as NextFunction;
export const Ajv = new ajv({ strict: false });
export const mockKnex = jest.fn() as unknown as Knex;

export const waitUntil = async (
    conditionEvaluator: () => boolean,
    timeoutMS: number,
    intervalMS: number
): Promise<boolean> => {
    let totalWaitTimeMS = 0;
    while (true) {
        await new Promise((r) => setTimeout(r, intervalMS));
        totalWaitTimeMS += intervalMS;
        if (conditionEvaluator()) {
            return true;
        }
        if (totalWaitTimeMS > timeoutMS) {
            return false;
        }
    }
};

export const waitForMS = async (howLong: number): Promise<void> => {
    await new Promise((r) => setTimeout(r, howLong));
};
