import { Request, Response } from 'express';
import { myErrorHandler } from '../../../src/middleware/error_handler';
import { mockNext } from '../utils/mocks';
import APIError from '../../../src/handlers/api_error';

describe('error_handler tests', () => {
    it('handels APIError', () => {
        const statusCode = 420;
        const message = 'blaze it yo';
        const err = new APIError(statusCode, message);

        const resRef = {
            status: jest.fn(),
            set: jest.fn(),
            send: jest.fn(),
        };
        const res = resRef as unknown as Response;

        myErrorHandler(err, jest.fn() as unknown as Request, res, mockNext);

        expect(resRef.set).toBeCalledWith('Content-Type', 'application/json');
        expect(resRef.status).toBeCalledWith(statusCode);
        expect(resRef.send).toBeCalledWith({ message: message });
    });

    it('handles non-APIErrors', () => {
        const message = 'blaze it yo';
        const err = new Error(message);

        const resRef = {
            status: jest.fn(),
            set: jest.fn(),
            send: jest.fn(),
        };
        const res = resRef as unknown as Response;

        myErrorHandler(err, jest.fn() as unknown as Request, res, mockNext);

        expect(resRef.set).toBeCalledWith('Content-Type', 'application/json');
        expect(resRef.status).toBeCalledWith(500);
        expect(resRef.send).toBeCalledWith({ message: 'unknown error' });
    });
});
