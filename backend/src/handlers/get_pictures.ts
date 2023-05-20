import { GetPicturesInput, GetPicturesOutput } from 'dwf-3-models-tjb';
import API from './api';
import APIError from './api_error';
import IDB from '../db';

export class GetPictures extends API {
    constructor(db: IDB) {
        super(db, 'GET', 'pictures');
    }

    public getInput(body: any): GetPicturesInput {
        body;
        return {};
    }

    public async process(
        db: IDB,
        input: GetPicturesInput
    ): Promise<GetPicturesOutput> {
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
