import { Request, Response } from 'express';
import IDB from '../db';

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
    public async call(req: Request<{}, {}, I>, res: Response) {
        const output = await this.process(this.db, req.body);

        const serialized_output = this.serializeOutput(output);

        res.set('Content-Type', this.getContentType());
        res.status(200);
        res.send(serialized_output);
    }

    // TODO got ride of getInput
    // 1. does a bad input throw? - can check with integ tests. but can I check in unit tests too?

    public abstract process(db: IDB, input: I): Promise<O>;

    public getMethod() {
        return this.method;
    }

    public getEntity() {
        return this.entity;
    }

    public getContentType(): string {
        return 'application/json';
    }

    public serializeOutput(output: O): string {
        return JSON.stringify(output);
    }
}
