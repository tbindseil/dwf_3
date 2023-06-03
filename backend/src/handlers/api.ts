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
                throw new APIError(400, 'invalid input');
            }

            const output = await this.process(req.body);
            const serialized_output = this.serializeOutput(output);

            res.set('Content-Type', this.getContentType());
            res.status(200);
            res.send(serialized_output);
        } catch (error: unknown) {
            if (error instanceof APIError) {
                next(error);
            } else {
                console.error('generic failure to handle request');
                console.error(error);
                next(new APIError(500, 'generic failure to handle request'));
            }
        }
    }

    public abstract provideInputValidationSchema(): ValidateFunction;
    public abstract process(input: I): Promise<O>;

    public getContentType(): string {
        return 'application/json';
    }

    public serializeOutput(output: O): string | Buffer {
        return JSON.stringify(output);
    }
}
