import API from './handlers/api';

export default class Router {
    private methods: Map<string, API>;

    constructor() {
        this.methods = new Map();
    }

    public add_method(api: API) {
        const key = this.get_key(api.getMethod(), api.getEntity());

        if (!this.methods.has(key)) {
            this.methods.set(key, api);
        }
    }

    public async route(req: any, res: any): Promise<void> {
        const key = this.get_key(req.method, req.url.split('/').at(1));

        if (!this.methods.has(key)) {
            res.statusCode = 400;
            res.write(JSON.stringify({'msg': 'error'}));
            res.end();
            return;
        }

        const body = await stream_request(req);
        const output = await this.methods.get(key)!.call(body)
        res.write(output);
        res.end();
    }

    private get_key(method: string, entity: string): string {
        return `${method}${entity}`;
    }
}

// alright, next up test this and changes to router/api, then start repeating this structure
// maybe test post before repeating
async function stream_request(req: any): Promise<any> {
    const buffers: Uint8Array[] = [];

    for await (const chunk of req) {
        buffers.push(chunk);
    }

    const data = Buffer.concat(buffers).toString();
    return JSON.parse(data);
}
