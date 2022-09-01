import {
    ErrorHandlerInput,
    ErrorHandlerOutput
} from 'dwf-3-models-tjb';
import {
    API
} from './api';


export class ErrorHandler extends API {
    public get_input(req: any): ErrorHandlerInput {
        console.log('ErrorHandler.get_input');
        req;
        return {};
    }

    public process(input: ErrorHandlerInput): ErrorHandlerOutput {
        console.log('ErrorHandler.process');
        input;
        return {
            msg: 'all pictures'
        }
    }
}


export function error_handler(): void {
    console.log('error_handler');
    // res.statusCode = 400; // 400 = Bad request
    // res.write(JSON.stringify({'msg': 'error'}));
    // res.end();
}
