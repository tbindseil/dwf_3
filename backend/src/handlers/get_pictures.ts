import {
    GetPicturesInput,
    GetPicturesOutput
} from 'dwf-3-models-tjb';
import {
    API
} from './api';


export class GetPictures extends API {
    public get_input(req: any): GetPicturesInput {
        console.log('GetPictures.get_input');
        req;
        return {};
    }

    public process(input: GetPicturesInput): GetPicturesOutput {
        console.log('GetPictures.process');
        input;
        return {
            msg: 'all pictures'
        }
    }
}

export function get_pictures(req: any, res: any): void {
    // TODO return list of all photos by name and maybe include a thumbnail
    console.log('get_pictures');

    let input = make_get_pictures_input(req);
    input;

    let output: GetPicturesOutput = {
        msg: 'all pictures'
    };
    res.write(JSON.stringify(output));
    res.end();
}

export function make_get_pictures_input(req: any): GetPicturesInput {
    req;
    return {};
}


