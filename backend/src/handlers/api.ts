import {Request, Response} from 'express';
import APIError from './api_error';

export default class API {
    public static readonly DEFAULT_ERROR_STATUS_CODE = 500;
    public static readonly DEFAULT_ERROR_MSG = JSON.stringify({'msg': 'unknown error'});

    private method: string;
    private entity: string;

    constructor(method: string, entity: string) {
        this.method = method;
        this.entity = entity;
    }

    public async call(req: Request, res: Response) {
        try {
            const input = this.getInput(req.body);
            const output = await this.process(input);

            const serialized_output = this.serializeOutput(output);

            res.set('Content-Type', this.getContentType());
            res.sendStatus(200);
            res.send(serialized_output);
        } catch (error: any) {
            let body, statusCode;
            if (error instanceof APIError) {
                body = error.message;
                statusCode = error.statusCode;
            } else {
                console.error(`error is: ${error}`);
                statusCode = API.DEFAULT_ERROR_STATUS_CODE;
                body = API.DEFAULT_ERROR_MSG;
            }
            res.sendStatus(statusCode);
            res.send(body);
        }
    }

    public getInput(body: any): any {
        body;
        throw new Error('api.getInput not implemented');
    }

    public async process(input: any): Promise<any> {
        input;
        throw new Error('api.process not implemented');
    }

    public getMethod() {
        return this.method;
    }

    public getEntity() {
        return this.entity;
    }

    public getContentType(): string {
        return 'application/json';
    }

    public serializeOutput(output: any): any {
        return JSON.stringify(output);
    }
}
