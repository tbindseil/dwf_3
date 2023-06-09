import { NextFunction } from 'express';
import ajv from 'ajv';
import { Knex } from 'knex';

export const mockNext = jest.fn() as unknown as NextFunction;
export const Ajv = new ajv({ strict: 'log' });
export const mockKnex = jest.fn() as unknown as Knex;
