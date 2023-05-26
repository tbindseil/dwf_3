import { NextFunction } from 'express';
import ajv from 'ajv';

export const mockNext = jest.fn() as unknown as NextFunction;
export const Ajv = new ajv();
