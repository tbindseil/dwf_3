import API from './handlers/api';
import { stream_request } from './stream_request';

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
