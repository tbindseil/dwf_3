import API from './handlers/api';
import APIError from './handlers/api_error';
import { stream_request } from './stream_request';

export default class Router {
    public static readonly DEFAULT_ERROR_STATUS_CODE = 500;
    public static readonly DEFAULT_ERROR_MSG = JSON.stringify({'msg': 'unknown error'});

    private methods: Map<string, API>;

    constructor() {
        this.methods = new Map();
    }

    public add_method(api: API) {
        const key = this.getKey(api.getMethod(), api.getEntity());

        if (!this.methods.has(key)) {
            this.methods.set(key, api);
        }
    }

    public async route(req: any, res: any): Promise<void> {
        const key = this.getKey(req.method, req.url.split('/').at(1));

        if (!this.methods.has(key)) {
            res.statusCode = 404;
            res.write(JSON.stringify({'msg': 'error, invalid method or entity'}));
            res.end();
            return;
        }

        try {
            const body = await stream_request(req); // basically, all pieces of code need to be atomic between awaits
            // so what are the atomic parts (check time of each)
            // 1. updating the photo (in memory i think) and posting the update to the queues
            // 2. registering a client to a picture and returning the picture 
            // I think these can all be atomic
            // there are two things to learn next
            // 1. how to create a socket - use socket.io
            // 2. how to unpack a png into a pixel array - check out jimp: https://www.npmjs.com/package/jimp
            //
            //
            // i think i might actually want a db of updates
            // this is because the client could disconnect and reconnect, and at that point, we either resync the photo or use the db to get the missed updates
            const output = await this.methods.get(key)!.call(body)

            // TODO can i get rid of these?
            const headers = {
                'Access-Control-Allow-Origin': '*', /* @dev First, read about security */
                'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
                'Access-Control-Max-Age': 2592000, // 30 days
                /** add other headers as per requirement */
                'Content-Type': this.methods.get(key)!.getContentType()
            };

            res.writeHead(200, headers);
            res.write(output);
            res.end();
        } catch (error: any) {
            let body, statusCode;
            if (error instanceof APIError) {
                body = error.message;
                statusCode = error.statusCode;
            } else {
                console.log(`error is: ${error}`);
                statusCode = Router.DEFAULT_ERROR_STATUS_CODE;
                body = Router.DEFAULT_ERROR_MSG;
            }
            res.statusCode = statusCode;
            res.write(body);
            res.end();
        }
    }

    private getKey(method: string, entity: string): string {
        return `${method}${entity}`;
    }
}
