export default class API {
    private method: string;
    private entity: string;

    constructor(method: string, entity: string) {
        this.method = method;
        this.entity = entity;
    }

    public async call(body: any): Promise<string> {
        const input = this.getInput(body);
        const output = await this.process(input);

        const serialized_output = JSON.stringify(output);

        return serialized_output;
    }

    public getInput(body: any): any {
        body;
        throw new Error('api.getInput not implemented');
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

    public getContentType(): string {
        return 'application/json';
    }
}
