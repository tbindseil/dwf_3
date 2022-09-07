export default class API {
    private method: string;
    private entity: string;

    constructor(method: string, entity: string) {
        this.method = method;
        this.entity = entity;
    }

    public call(req: any): string {
        console.log('1.1');
        const input = this.get_input(req);
        console.log('1.2');
        const output = this.process(input);
        console.log('1.3');

        const serialized_output = JSON.stringify(output);

        return serialized_output;
    }

    public processQueryResult(err: any, result: any, success_obj: { success: boolean }): void {
        if (err) {
            console.log(`err is ${err}`);
            success_obj.success = false;
        } else {
            success_obj.success = true;
        }

        this.onSuccess(result);
    }

    public onSuccess(result: any): void {
        // be default, do nothing
        console.log(`result is ${JSON.stringify(result)}`);
    }

    public async get_input(req: any): Promise<any> {
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
