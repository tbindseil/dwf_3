import { NextFunction, Request, Response } from 'express';
import IDB from '../db';
import APIError from './api_error';

export default abstract class API<I, O> {
    public static readonly DEFAULT_ERROR_STATUS_CODE = 500;
    public static readonly DEFAULT_ERROR_MSG = JSON.stringify({
        msg: 'unknown error',
    });

    private readonly db: IDB;
    private readonly method: string;
    private readonly entity: string;

    constructor(db: IDB, method: string, entity: string) {
        this.db = db;
        this.method = method;
        this.entity = entity;
    }

    // TODO can i also do this with the response, do i even need to?
    public async call(
        req: Request<{}, {}, I>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const output = await this.process(this.db, req.body, next);
            const serialized_output = this.serializeOutput(output);

            res.set('Content-Type', this.getContentType());
            res.status(200);
            res.send(serialized_output);
        } catch (error: unknown) {
            // do nothing, error handling middleware takes care of this
        }
    }

    // TODO got ride of getInput
    // 1. does a bad input throw? - can check with integ tests. but can I check in unit tests too?
    // 2. routing! based on input type

    public abstract process(db: IDB, input: I, next: NextFunction): Promise<O>;

    public getMethod() {
        return this.method;
    }

    public getEntity() {
        return this.entity;
    }

    public getContentType(): string {
        return 'application/json';
    }

    public serializeOutput(output: O): string | Buffer {
        return JSON.stringify(output);
    }

    // for some reason, when I throw an error, it doesn't get handled, but when I
    // call the next(error) function it is. So, I have to call next() and then
    // exit the method. I was throwing after next, and that was working, but wanted
    // to encapsulate this (below), so this had to be made..
    protected handleError(apiError: APIError, next: NextFunction): Promise<O> {
        next(apiError);
        throw apiError;
    }
}
