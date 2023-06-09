import { NextFunction, Request, Response } from 'express';
import APIError from './api_error';
import Ajv, { ValidateFunction } from 'ajv';
import { Knex } from 'knex';
import { makeKnex } from '../db/knex_file';

export default abstract class API<I, O> {
    protected readonly ajv: Ajv;

    constructor() {
        this.ajv = new Ajv({ strict: 'log' });
        // models might have to provide this list of inputs, otherwise its duplicated
        // this.ajv = new Ajv({ strict: true });
        // this.ajv.addVocabulary(['GetPictureInput', ...]);
    }

    // this calls mockKnex, i need a way to stub that when unit testing
    public async call(
        req: Request<unknown, O, I>,
        res: Response,
        next: NextFunction
    ) {
        const scopedKnex = makeKnex();

        try {
            const validator = this.provideInputValidationSchema();
            if (!validator(req.body)) {
                throw new APIError(400, 'invalid input');
            }

            const output = await this.process(req.body, scopedKnex);
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
        } finally {
            scopedKnex.destroy();
        }
    }

    public abstract provideInputValidationSchema(): ValidateFunction;
    public abstract process(input: I, knex: Knex): Promise<O>;

    public getContentType(): string {
        return 'application/json';
    }

    public serializeOutput(output: O): string | Buffer {
        return JSON.stringify(output);
    }
}
