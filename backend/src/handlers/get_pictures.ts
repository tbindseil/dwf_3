import { GetPicturesInput, GetPicturesOutput, _schema } from 'dwf-3-models-tjb';
import API from './api';
import APIError from './api_error';
import IDB from '../db';
import { NextFunction } from 'express';
import { ValidateFunction } from 'ajv';

export class GetPictures extends API<GetPicturesInput, GetPicturesOutput> {
    constructor(db: IDB) {
        super(db, 'GET', 'pictures');
    }

    public provideInputValidationSchema(): ValidateFunction {
        return this.ajv.compile(_schema.GetPictureInput);
    }

    public async process(
        db: IDB,
        input: GetPicturesInput,
        next: NextFunction
    ): Promise<GetPicturesOutput> {
        next;
        input;

        const query = 'select * from picture;';
        const params: string[] = [];

        try {
            const result = await db.query(query, params);
            return {
                pictures: result.rows.map((row: any) => {
                    return {
                        id: row.id,
                        name: row.name,
                        createdBy: row.createdby, // Heads up! createdby instead of createdBy - postgres is case insensitive
                        filename: row.filename,
                        filesystem: row.filesystem,
                    };
                }),
            };
        } catch (error) {
            console.error('get_pictures and error is: ', error);
            throw new APIError(500, 'database issue, pictures not fetched');
        }
    }
}
