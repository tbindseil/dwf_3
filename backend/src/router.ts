import {
    API
} from './handlers/api';

export class Router {
    private methods: Map<string, API>;

    constructor() {
        this.methods = new Map();
    }

    public add_method(api: API) {
        const key = this.get_key(api.method, api.entity);

        if (!this.methods.has(key)) {
            this.methods.set(key, api);
        }
    }

    public route(req: any, res: any): void {
        const key = this.get_key(req.method, req.url.split('/').at(-1));

        if (!this.methods.has(key)) {
            res.statusCode = 400; // 400 = Bad request
            res.write(JSON.stringify({'msg': 'error'}));
            res.end();
            return;
        }

        // TODO hmmm
        this.methods.get(key)!.call(req, res);
        res.end();
    }

    private get_key(method: string, entity: string): string {
        return `${method}${entity}`;
    }
}
