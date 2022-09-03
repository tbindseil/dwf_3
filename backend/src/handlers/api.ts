export default class API {
    private method: string;
    private entity: string;

    constructor(method: string, entity: string) {
        this.method = method;
        this.entity = entity;
    }

    public call(req: any): string {
        const input = this.get_input(req);
        const output = this.process(input);

        const serialized_output = JSON.stringify(output);

        return serialized_output;
    }

    public get_input(req: any): any {
        req;
        throw new Error('api.get_input not implemented');
    }

    public process(input: any): any {
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
