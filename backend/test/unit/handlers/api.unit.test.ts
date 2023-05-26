import { NextFunction, Request, Response } from 'express';
import API from '../../../src/handlers/api';
import IDB from '../../../src/db';
import { ValidateFunction } from 'ajv';
import { mockNext } from '../mock/utils';
import APIError from '../../../src/handlers/api_error';

const method = 'METHOD';
const entity = 'ENTITY';

const specialInput = { test: 'SPECIAL_INPUT' };
const specialOutput = { test: 'SPECIAL_OUTPUT' };
const serializedSpecialOutput = JSON.stringify({ test: 'SPECIAL_OUTPUT' });

class TestAPI extends API<
    { [key: string]: string },
    { [key: string]: string }
> {
    validatorReturnValue: boolean;

    constructor(
        db: IDB,
        method: string,
        entity: string,
        validatorReturnValue: boolean
    ) {
        super(db, method, entity);
        this.validatorReturnValue = validatorReturnValue;
    }

    public provideInputValidationSchema(): ValidateFunction<unknown> {
        const validator = jest.fn();
        validator.mockReturnValue(this.validatorReturnValue);
        return validator as unknown as ValidateFunction<unknown>;
    }

    public async process(
        db: IDB,
        input: any,
        next: NextFunction
    ): Promise<any> {
        db;
        next;
        if (input === specialInput) {
            return specialOutput;
        } else {
            return {};
        }
    }
}

describe('API Tests', () => {
    const mockDB = {} as IDB;
    let api: TestAPI;
    beforeEach(() => {
        api = new TestAPI(mockDB, method, entity, true);
    });

    it('calls', async () => {
        const req = { body: specialInput } as Request;
        const res = {
            set: jest.fn(),
            status: jest.fn(),
            send: jest.fn(),
        } as unknown as Response;

        await api.call(req, res, mockNext);
        expect(res.set).toHaveBeenCalledWith(
            'Content-Type',
            'application/json'
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(serializedSpecialOutput);
    });

    it('validates input', async () => {
        const req = { body: specialInput } as Request;
        const res = {
            set: jest.fn(),
            status: jest.fn(),
            send: jest.fn(),
        } as unknown as Response;

        const apiProgrammedToFailValidation = new TestAPI(
            mockDB,
            method,
            entity,
            false
        );
        await apiProgrammedToFailValidation.call(req, res, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
            new APIError(400, 'invalid input')
        );
        expect(res.set).toHaveBeenCalledTimes(0);
        expect(res.status).toHaveBeenCalledTimes(0);
        expect(res.send).toHaveBeenCalledTimes(0);
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
