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
            res.statusCode = 400;
            res.write(JSON.stringify({'msg': 'error'}));
            res.end();
            return;
        }

        // get data from req here, then pass it in to the callcall below


        this.methods.get(key)!.call(req)
            .then((output: string) => {
                res.write(output);
                res.end();
            });
    }

    private get_key(method: string, entity: string): string {
        return `${method}${entity}`;
    }
}
