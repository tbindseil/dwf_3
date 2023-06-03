import { GetPicturesInput, GetPicturesOutput, _schema } from 'dwf-3-models-tjb';
import API from './api';
import { ValidateFunction } from 'ajv';
import PictureObjectionModel from './picture_objection_model';

export class GetPictures extends API<GetPicturesInput, GetPicturesOutput> {
    public provideInputValidationSchema(): ValidateFunction {
        return this.ajv.compile(_schema.GetPictureInput);
    }

    public async process(input: GetPicturesInput): Promise<GetPicturesOutput> {
        input;

        const result = await PictureObjectionModel.query();

        return {
            // TODO once objection model is in models, this should just be return { pictures: result }
            pictures: result.map((row: PictureObjectionModel) => {
                return {
                    id: row.id,
                    name: row.name,
                    createdBy: row.created_by,
                    filename: row.filename,
                    filesystem: row.filesystem,
                };
            }),
        };
    }
}
