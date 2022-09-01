export class API {
    constructor() {
    }

    public call(req: any, res: any): void {
        const input = this.get_input(req);
        const output = this.process(input); // umm this might not by typeable

        console.log(`output is ${output}`);

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
}
