import {Request, Response} from 'express';
import IDB from '../db';

export default abstract class API {
    public static readonly DEFAULT_ERROR_STATUS_CODE = 500;
    public static readonly DEFAULT_ERROR_MSG = JSON.stringify({'msg': 'unknown error'});

    private readonly db: IDB;
    private readonly method: string;
    private readonly entity: string;

    constructor(db: IDB, method: string, entity: string) {
        this.db = db;
        this.method = method;
        this.entity = entity;
    }

    public async call(req: Request, res: Response) {
        const input = this.getInput(req.body);
        const output = await this.process(this.db, input);

        const serialized_output = this.serializeOutput(output);

        res.set('Content-Type', this.getContentType());
        res.sendStatus(200);
        res.send(serialized_output);
    }

    public abstract getInput(body: any): any;

    public abstract process(db: IDB, input: any): Promise<any>;

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
