import API from '../src/handlers/api';
import Router from '../src/router';

jest.mock('../src/handlers/api');
const mockAPI = jest.mocked(API, true);

beforeEach(() => {
    mockAPI.mockClear();
});

it('Routes to an API after the API is registered', () => {
    const router = new Router();
    const method = 'METHOD';
    const entity = 'ENTITY';
    const req = {
        method: method,
        url: `/${entity}/`
    };
    const res = {
        statusCode: 0,
        write: (s: string) => {s;},
        end: () => {}
    }

    const mockAPIInstance = new API(method, entity);

    const mockGetEntity = mockAPIInstance.getEntity as jest.Mock;
    mockGetEntity.mockImplementation(() => { return entity });
    const mockGetMethod = mockAPIInstance.getMethod as jest.Mock;
    mockGetMethod.mockImplementation(() => { return method });

    router.add_method(mockAPIInstance);

    router.route(req, res);

    const mockCall = mockAPIInstance.call as jest.Mock;
    expect(mockCall).toHaveBeenCalledTimes(1);
    expect(mockCall).toHaveBeenCalledWith(req, res);
});

it('Ends the result after a successful API call', () => {
    const router = new Router();
    const method = 'METHOD';
    const entity = 'ENTITY';
    const req = {
        method: method,
        url: `/${entity}/`
    };
    let ended = false;
    const res = {
        statusCode: 0,
        write: (s: string) => {s;},
        end: () => { ended = true; }
    }

    const mockAPIInstance = new API(method, entity);

    const mockGetEntity = mockAPIInstance.getEntity as jest.Mock;
    mockGetEntity.mockImplementation(() => { return entity });
    const mockGetMethod = mockAPIInstance.getMethod as jest.Mock;
    mockGetMethod.mockImplementation(() => { return method });

    router.add_method(mockAPIInstance);

    router.route(req, res);

    expect(ended).toBeTruthy();
});

it('Writes error message to and closes the result when an unregistered API is called', () => {
    const router = new Router();
    const registeredMethod = 'REGISTERED_METHOD';
    const regesteredEntity = 'REGISTERED_ENTITY';
    const method = 'METHOD';
    const entity = 'ENTITY';
    const req = {
        method: method,
        url: `/${entity}/`
    };
    let ended = false;
    let written = false;
    let whatWasWritten = '';
    const res = {
        statusCode: 0,
        write: (s: string) => { whatWasWritten = s; written = true; },
        end: () => { ended = true; }
    }

    const mockAPIInstance = new API(registeredMethod, regesteredEntity);

    const mockGetMethod = mockAPIInstance.getMethod as jest.Mock;
    mockGetMethod.mockImplementation(() => { return registeredMethod });
    const mockGetEntity = mockAPIInstance.getEntity as jest.Mock;
    mockGetEntity.mockImplementation(() => { return regesteredEntity });

    router.add_method(mockAPIInstance);

    router.route(req, res);

    expect(written).toBeTruthy();
    expect(whatWasWritten).toEqual(JSON.stringify({'msg': 'error'}));
    expect(res.statusCode).toEqual(400);
    expect(ended).toBeTruthy();
});
