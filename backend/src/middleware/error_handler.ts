import { NextFunction, Request, Response } from 'express';
import APIError from '../handlers/api_error';

export interface Error {
    status?: number;
    message?: string;
}

export const myErrorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    req;
    next;

    res.set('Content-Type', 'application/json');
    if (err instanceof APIError) {
        const apiError = err as APIError;
        res.status(apiError.statusCode);
        res.send({ message: apiError.message });
    } else {
        res.status(500);
        res.send({ message: 'unknown error' });
    }
};
