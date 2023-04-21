import {Request, Response} from 'express';
import API from '../../src/handlers/api';
import IDB from '../../src/db';

const method = 'METHOD';
const entity = 'ENTITY';

const specialInput = { test: 'SPECIAL_INPUT' };
const specialOutput = { test: 'SPECIAL_OUTPUT' };
const serializedSpecialOutput = JSON.stringify({ test: 'SPECIAL_OUTPUT' });


class TestAPI extends API {
    constructor(db: IDB, method: string, entity: string) {
        super(db, method, entity);
    }

    public getInput(req: any): any {
        req;
        return specialInput;
    }

    public async process(db: IDB, input: any): Promise<any> {
        db;
        if (input === specialInput) {
            return specialOutput;
        } else {
            return {};
        }
    }
}


describe('API Tests', () => {
    const mockDB = {} as IDB;
    let api: API;
    beforeEach(() => {
        api = new TestAPI(mockDB, method, entity);
    });

    it('calls', async () => {
        const req = { body: specialInput } as Request;
        // TODO, I wonder if I could write a more generatic basic mock factory? Maybe that is already done by jest
        const res = {
            set: jest.fn(),
            sendStatus: jest.fn(),
            send: jest.fn()
        } as unknown as Response;

        const api = new TestAPI(mockDB, entity, method);
        await api.call(req, res);
        expect(res.set).toHaveBeenCalledWith('Content-Type', 'application/json');
        expect(res.sendStatus).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(serializedSpecialOutput);
    });

    it('method getter', () => {
        const returnedMethod = api.getMethod();
        expect(returnedMethod).toEqual(method);
    });

    it('entity getter', () => {
        const returnedEntity = api.getEntity();
        expect(returnedEntity).toEqual(entity);
    });

    it('gives json content type by default', () => {
        const contentType = api.getContentType();
        expect(contentType).toEqual('application/json');
    });

    it('uses JSON.stringify to serialize output by default', () => {
        const resultingSerializedOutput = api.serializeOutput(specialOutput);
        expect(resultingSerializedOutput).toEqual(serializedSpecialOutput);
    });
});
