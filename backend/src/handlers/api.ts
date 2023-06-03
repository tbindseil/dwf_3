import { NextFunction, Request, Response } from 'express';
import APIError from './api_error';
import Ajv, { ValidateFunction } from 'ajv';

export default abstract class API<I, O> {
    public static readonly DEFAULT_ERROR_STATUS_CODE = 500;
    public static readonly DEFAULT_ERROR_MSG = JSON.stringify({
        msg: 'unknown error',
    });

    protected readonly ajv: Ajv;

    constructor() {
        // TODO inject this
        this.ajv = new Ajv();
    }

    // TODO can i also do this with the response, do i even need to?
    public async call(
        req: Request<{}, {}, I>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const validator = this.provideInputValidationSchema();
            if (!validator(req.body)) {
                this.handleError(new APIError(400, 'invalid input'), next);
            }
        } catch (error: unknown) {
            return; // need to bail
        }

        try {
            const output = await this.process(req.body, next);
            const serialized_output = this.serializeOutput(output);

            res.set('Content-Type', this.getContentType());
            res.status(200);
            res.send(serialized_output);
        } catch (error: unknown) {
            // do nothing, error handling middleware takes care of this
        }
    }

    public abstract provideInputValidationSchema(): ValidateFunction;
    public abstract process(input: I, next: NextFunction): Promise<O>;

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
