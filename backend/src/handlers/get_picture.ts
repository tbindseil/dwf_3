import { GetPictureInput, GetPictureOutput } from 'dwf-3-models-tjb';
import API from './api';
import APIError from './api_error';
import IDB from '../db';
import PictureAccessor from '../picture_accessor/picture_accessor';
import { NextFunction } from 'express';

export class GetPicture extends API<GetPictureInput, GetPictureOutput> {
    private readonly pictureAccessor: PictureAccessor;

    constructor(db: IDB, pictureAccessor: PictureAccessor) {
        super(db, 'GET', 'picture');

        this.pictureAccessor = pictureAccessor;
    }

    public async process(
        db: IDB,
        input: GetPictureInput,
        next: NextFunction
    ): Promise<GetPictureOutput> {
        const query = 'select filename from picture where id = ?;';

        // so this will throw TypeError
        let params: string[] = [];
        try {
            params = [input.id.toString()];
        } catch (error: any) {
            // TODO TJTAG instead of doing this, setup a middleware that goes
            // before the apis and returns 404 on bad stuff
            // also, maybe learn how to do error handling cause this aint working
            // throw new APIError(400, 'database issue, picture not fetched');
            //             const notATypeError = new Error('notATypeError') as any;
            //             notATypeError.status = 400;
            //             throw notATypeError;
            // error.status = 400;
            // const notANAPIError = new Error('notANAPIError');
            // notATypeError.status = 400;
            // next(notANAPIError);
            // return next(error);

            // ok, seems like ...
            // this stuff is weird in typescript
            // I guess this needs to be a function that returns Promise<GetPictureOutput>
            // and ...
            console.log(`@@@@ TJTAG @@@@ error is: ${JSON.stringify(error)}`);
            error.message = 'Hellow worle';
            next(error);
            throw error;
        }

        try {
            const result = await db.query(query, params);
            const filename = result.rows[0].filename;
            return await this.pictureAccessor.getPicture(filename);
        } catch (error) {
            throw new APIError(500, 'database issue, picture not fetched');
        }
    }

    public getContentType(): string {
        return 'image/png';
    }

    public serializeOutput(output: GetPictureOutput): Buffer {
        return output;
    }
}
