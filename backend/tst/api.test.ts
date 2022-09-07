import API from '../src/handlers/api';

const method = 'METHOD';
const entity = 'ENTITY';

const specialInput = { test: 'SPECIAL_INPUT' };
const specialOutput = { test: 'SPECIAL_OUTPUT' };
const serializedSpecialOutput = JSON.stringify({ test: 'SPECIAL_OUTPUT' });


class TestAPI extends API {
    constructor(entity: string, method: string) {
        super(method, entity);
    }

    public async get_input(req: any): Promise<any> {
        req;
        return specialInput
    }

    public async process(input: any): Promise<any> {
        if (input === specialInput) {
            return specialOutput;
        } else {
            return {};
        }
    }
}


describe('API Tests', () => {
    it('calls', async () => {
        const api = new TestAPI(entity, method);
        const result = await api.call({});
        expect(result).toEqual(serializedSpecialOutput);       
    });

    it('throws on get_input', async () => {
        const api = new API(entity, method);
        await expect(api.get_input({})).rejects.toThrow('api.get_input not implemented');
    });

    it('throws on process', async () => {
        const api = new API(entity, method);
        await expect(api.process({})).rejects.toThrow('api.process not implemented');
    });

    it('method getter', () => {
        const api = new API(method, entity);
        const returnedMethod = api.getMethod();
        expect(returnedMethod).toEqual(method);
    });

    it('entity getter', () => {
        const api = new API(method, entity);
        const returnedEntity = api.getEntity();
        expect(returnedEntity).toEqual(entity);
    });
});
