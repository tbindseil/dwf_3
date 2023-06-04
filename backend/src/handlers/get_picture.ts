import {
    GetPictureInput,
    GetPictureOutput,
    Picture,
    _schema,
} from 'dwf-3-models-tjb';
import API from './api';
import APIError from './api_error';
import PictureAccessor from '../picture_accessor/picture_accessor';
import { ValidateFunction } from 'ajv';

export class GetPicture extends API<GetPictureInput, GetPictureOutput> {
    private readonly pictureAccessor: PictureAccessor;

    constructor(pictureAccessor: PictureAccessor) {
        super();

        this.pictureAccessor = pictureAccessor;
    }

    public provideInputValidationSchema(): ValidateFunction {
        return this.ajv.compile(_schema.GetPictureInput);
    }

    public async process(input: GetPictureInput): Promise<GetPictureOutput> {
        const query = Picture.query().findById(input.id);
        const picture = await query;

        if (!picture || !picture.filename) {
            throw new APIError(400, 'picture not found');
        } else {
            return await this.pictureAccessor.getPicture(picture.filename);
        }
    }

    public getContentType(): string {
        return 'image/png';
    }

    public serializeOutput(output: GetPictureOutput): Buffer {
        return output;
    }
}
