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

    public get_input(req: any): any {
        req;
        return specialInput
    }

    public process(input: any): any {
        if (input === specialInput) {
            return specialOutput;
        } else {
            return {};
        }
    }
}


describe('API Tests', () => {
    it('calls', () => {
        const api = new TestAPI(entity, method);
        const result = api.call({});
        expect(result).toEqual(serializedSpecialOutput);       
    });

    it('throws on get_input', () => {
        const api = new API(entity, method);
        expect(() => {
            api.get_input({})
        }).toThrow('api.get_input not implemented');
    });

    it('throws on process', () => {
        const api = new API(entity, method);
        expect(() => {
            api.process({})
        }).toThrow('api.process not implemented');
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
