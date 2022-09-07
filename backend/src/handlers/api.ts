export default class API {
    private method: string;
    private entity: string;

    constructor(method: string, entity: string) {
        this.method = method;
        this.entity = entity;
    }

    public async call(req: any): Promise<string> {
        const input = await this.get_input(req);
        const output = await this.process(input);

        const serialized_output = JSON.stringify(output);

        return serialized_output;
    }

    public async get_input(req: any): Promise<any> {
        req;
        throw new Error('api.get_input not implemented');
    }

    public async process(input: any): Promise<any> {
        input;
        throw new Error('api.process not implemented');
    }

    public getMethod() {
        return this.method;
    }

    public getEntity() {
        return this.entity;
    }
}
