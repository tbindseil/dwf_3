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

    public route(req: any, res: any): void {
        const key = this.get_key(req.method, req.url.split('/').at(1));

        if (!this.methods.has(key)) {
            res.statusCode = 400; // 400 = Bad request
            res.write(JSON.stringify({'msg': 'error'}));
            res.end();
            return;
        }

        try {
            console.log('0');
            const output = this.methods.get(key)!.call(req);
            console.log('1');
            res.write(output);
            console.log('2');
            res.end();
        } catch (error) {
            console.log(`error is: ${error}`);
        }
    }

    private get_key(method: string, entity: string): string {
        return `${method}${entity}`;
    }
}
