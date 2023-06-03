import { GetPictureInput, GetPictureOutput, _schema } from 'dwf-3-models-tjb';
import API from './api';
import APIError from './api_error';
import PictureAccessor from '../picture_accessor/picture_accessor';
import { ValidateFunction } from 'ajv';
import PictureObjectionModel from './picture_objection_model';

export class GetPictureObjection extends API<
    GetPictureInput,
    GetPictureOutput
> {
    private readonly pictureAccessor: PictureAccessor;

    constructor(pictureAccessor: PictureAccessor) {
        super();

        this.pictureAccessor = pictureAccessor;
    }

    public provideInputValidationSchema(): ValidateFunction {
        return this.ajv.compile(_schema.GetPictureInput);
    }

    public async process(input: GetPictureInput): Promise<GetPictureOutput> {
        const query = PictureObjectionModel.query().findById(input.id);
        const filename = (await query)?.filename;

        if (!filename) {
            throw new APIError(400, 'picture not found');
        } else {
            return await this.pictureAccessor.getPicture(filename);
        }
    }

    public getContentType(): string {
        return 'image/png';
    }

    public serializeOutput(output: GetPictureOutput): Buffer {
        return output;
    }
}
