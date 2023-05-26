import { GetPictureInput, GetPictureOutput, _schema } from 'dwf-3-models-tjb';
import API from './api';
import APIError from './api_error';
import IDB from '../db';
import PictureAccessor from '../picture_accessor/picture_accessor';
import { NextFunction } from 'express';
import { ValidateFunction } from 'ajv';

export class GetPicture extends API<GetPictureInput, GetPictureOutput> {
    private readonly pictureAccessor: PictureAccessor;

    constructor(db: IDB, pictureAccessor: PictureAccessor) {
        super(db, 'GET', 'picture');

        this.pictureAccessor = pictureAccessor;
    }

    public provideInputValidationSchema(): ValidateFunction {
        return this.ajv.compile(_schema.GetPictureInput);
    }

    public async process(
        db: IDB,
        input: GetPictureInput,
        next: NextFunction
    ): Promise<GetPictureOutput> {
        const query = 'select filename from picture where id = ?;';
        const params = [input.id.toString()];

        try {
            const result = await db.query(query, params);
            const filename = result.rows[0].filename;
            return await this.pictureAccessor.getPicture(filename);
        } catch (error) {
            return this.handleError(
                new APIError(500, 'database issue, picture not fetched'),
                next
            );
        }
    }

    public getContentType(): string {
        return 'image/png';
    }

    public serializeOutput(output: GetPictureOutput): Buffer {
        return output;
    }
}
