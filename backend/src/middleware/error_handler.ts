import { NextFunction, Request, Response } from 'express';

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
    console.log('@@@@ TJTAG @@@@ returning 500');
    console.log('@@@@ TJTAG @@@@ returning 500');
    console.log('@@@@ TJTAG @@@@ returning 500');
    console.log('@@@@ TJTAG @@@@ returning 500');
    console.log('@@@@ TJTAG @@@@ returning 500');
    console.log('@@@@ TJTAG @@@@ returning 500');
    console.log('@@@@ TJTAG @@@@ returning 500');
    res.set('Content-Type', 'application/json');
    res.status(500);
    res.send({ error_message: err.message });
    //     res.status(
    //         err.status && (err.status >= 400 || err.status <= 599)
    //             ? err.status
    //             : 500
    //     ).send({
    //         error: err.message ? err.message : 'Issue ...',
    //     });
    // next(err);
};
