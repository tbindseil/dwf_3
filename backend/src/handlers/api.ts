export default class API {
    private method: string;
    private entity: string;

    constructor(method: string, entity: string) {
        this.method = method;
        this.entity = entity;
    }

    public call(req: any, res: any): void {
        const input = this.get_input(req);
        const output = this.process(input);

        res.write(JSON.stringify(output));
        res.end();
    }

    public get_input(req: any): any {
        req;
        console.log('API.get_input is abstract');
        return {};
    }

    public process(input: any): any {
        input;
        console.log('API.process is abstract');
        return {};
    }

    public getMethod() {
        return this.method;
    }

    public getEntity() {
        return this.entity;
    }
}
