import {Request, Response} from 'express';
import API from '../../src/handlers/api';

// jest.mock('express');
// const MockRequest = jest.mocked(Request, true);
// const MockResponse = jest.mocked(Response, true);

const method = 'METHOD';
const entity = 'ENTITY';

const specialInput = { test: 'SPECIAL_INPUT' };
const specialOutput = { test: 'SPECIAL_OUTPUT' };
const serializedSpecialOutput = JSON.stringify({ test: 'SPECIAL_OUTPUT' });


class TestAPI extends API {
    constructor(entity: string, method: string) {
        super(method, entity);
    }

    public getInput(req: any): any {
        req;
        return specialInput;
    }

    public async process(input: any): Promise<any> {
        if (input === specialInput) {
            return specialOutput;
        } else {
            return {};
        }
    }
}


describe('API Tests', () => {
    let api: API;
    beforeEach(() => {
        api = new API(method, entity);
    });

    it('calls', async () => {
        const req = { body: specialInput } as Request;
        const res = {
            set: jest.fn(),
            sendStatus: jest.fn(),
            send: jest.fn()
        } as unknown as Response;

        const api = new TestAPI(entity, method);
        await api.call(req, res);
        expect(res.set).toHaveBeenCalledWith('Content-Type', 'application/json');
        expect(res.sendStatus).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(serializedSpecialOutput);
    });

    it('throws on getInput', () => {
        expect(() => api.getInput({})).toThrow('api.getInput not implemented');
    });

    it('throws on process', async () => {
        await expect(api.process({})).rejects.toThrow('api.process not implemented');
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
