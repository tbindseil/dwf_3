import { Request, Response } from 'express';
import API from '../../../src/handlers/api';
import { ValidateFunction } from 'ajv';
import APIError from '../../../src/handlers/api_error';
import { mockNext } from '../mock/utils';

const specialInput = { test: 'SPECIAL_INPUT' };
const specialOutput = { test: 'SPECIAL_OUTPUT' };
const serializedSpecialOutput = JSON.stringify({ test: 'SPECIAL_OUTPUT' });

class TestAPI extends API<
    { [key: string]: string },
    { [key: string]: string }
> {
    validatorReturnValue: boolean;
    throwGenericFailure: boolean;
    throwAPIErrorFailure: boolean;

    constructor(
        validatorReturnValue: boolean,
        throwGenericFailure?: boolean,
        throwAPIErrorFailure?: boolean
    ) {
        super();
        this.validatorReturnValue = validatorReturnValue;
        this.throwGenericFailure = throwGenericFailure ?? false;
        this.throwAPIErrorFailure = throwAPIErrorFailure ?? false;
    }

    public provideInputValidationSchema(): ValidateFunction<unknown> {
        const validator = jest.fn();
        validator.mockReturnValue(this.validatorReturnValue);
        return validator as unknown as ValidateFunction<unknown>;
    }

    public async process(input: {
        [key: string]: string;
    }): Promise<{ [key: string]: string }> {
        if (this.throwGenericFailure) {
            throw new Error('message');
        }
        if (this.throwAPIErrorFailure) {
            throw new APIError(444, 'an actual APIError');
        }

        if (input === specialInput) {
            return specialOutput;
        } else {
            return {};
        }
    }
}

describe('API Tests', () => {
    const makeReqRes = (): [Request, Response] => {
        const req = { body: specialInput } as Request;
        const res = {
            set: jest.fn(),
            status: jest.fn(),
            send: jest.fn(),
        } as unknown as Response;

        return [req, res];
    };

    let api: TestAPI;
    beforeEach(() => {
        api = new TestAPI(true);
    });

    it('calls', async () => {
        const [req, res] = makeReqRes();
        await api.call(req, res, mockNext);
        expect(res.set).toHaveBeenCalledWith(
            'Content-Type',
            'application/json'
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(serializedSpecialOutput);
    });

    it('returns a 400 error upon invalid input', async () => {
        const req = { body: specialInput } as Request;
        const res = {
            set: jest.fn(),
            status: jest.fn(),
            send: jest.fn(),
        } as unknown as Response;

        const apiProgrammedToFailValidation = new TestAPI(false);
        await apiProgrammedToFailValidation.call(req, res, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
            new APIError(400, 'invalid input')
        );
        expect(res.set).toHaveBeenCalledTimes(0);
        expect(res.status).toHaveBeenCalledTimes(0);
        expect(res.send).toHaveBeenCalledTimes(0);
    });

    it('intercepts and returns generic 500 when unknown exception occurs during call', async () => {
        const [req, res] = makeReqRes();
        const apiWithGenericException = new TestAPI(true, true);
        await apiWithGenericException.call(req, res, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
            new APIError(500, 'generic failure to handle request')
        );
        expect(res.set).toHaveBeenCalledTimes(0);
        expect(res.status).toHaveBeenCalledTimes(0);
        expect(res.send).toHaveBeenCalledTimes(0);
    });

    it('passes api exceptions to middleware when they occur during call', async () => {
        const [req, res] = makeReqRes();
        const apiWithGenericException = new TestAPI(true, false, true);
        await apiWithGenericException.call(req, res, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
            new APIError(444, 'an actual APIError')
        );
        expect(res.set).toHaveBeenCalledTimes(0);
        expect(res.status).toHaveBeenCalledTimes(0);
        expect(res.send).toHaveBeenCalledTimes(0);
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
