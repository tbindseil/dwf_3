import { NextFunction, Request, Response } from 'express';
import APIError from './api_error';
import Ajv, { ValidateFunction } from 'ajv';
// import Ajv2019 from 'ajv/dist/2019';

export default abstract class API<I, O> {
    protected readonly ajv: Ajv;

    constructor() {
        this.ajv = new Ajv({ strict: 'log' });
        // models might have to provide this list of inputs, otherwise its duplicated
        // this.ajv = new Ajv({ strict: true });
        // this.ajv.addVocabulary(['GetPictureInput', ...]);
    }

    public async call(
        req: Request<unknown, O, I>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const validator = this.provideInputValidationSchema();
            console.log(`req.body is ${JSON.stringify(req.body)}`);
            if (!validator(req.body)) {
                throw new APIError(400, 'invalid input');
            }
            console.log('no errror');

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
