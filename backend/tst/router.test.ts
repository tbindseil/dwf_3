import API from '../src/handlers/api';
import Router from '../src/router';

jest.mock('../src/handlers/api');
const mockAPI = jest.mocked(API, true);


describe('Router Tests', () => {
    const registeredMethod = 'REGISTERED_METHOD';
    const registeredEntity = 'REGISTERED_ENTITY';
    const unregisteredMethod = 'UNREGISTERED_METHOD';
    const unregisteredEntity = 'UNREGISTERED_ENTITY';

    const registeredReq = {
        method: registeredMethod,
        url: `/${registeredEntity}/`
    };

    let ended: boolean;
    let written: boolean;
    let whatWasWritten: string;
    const res = {
        statusCode: 0,
        write: (s: string) => { whatWasWritten = s; written = true; },
        end: () => { ended = true; }
    };

    let router: Router;
    let mockAPIInstance: API;

    beforeEach(() => {
        mockAPI.mockClear();
        router = new Router();

        mockAPIInstance = new API(registeredMethod, registeredEntity);

        const mockGetMethod = mockAPIInstance.getMethod as jest.Mock;
        mockGetMethod.mockImplementation(() => { return registeredMethod });
        const mockGetEntity = mockAPIInstance.getEntity as jest.Mock;
        mockGetEntity.mockImplementation(() => { return registeredEntity });

        router.add_method(mockAPIInstance);

        ended = false;
        written = false;
        whatWasWritten = '';
    });

    describe('Router with a registered API', () => {
        it('Routes to an API after the API is registered', () => {
            router.route(registeredReq, res);

            const mockCall = mockAPIInstance.call as jest.Mock;
            expect(mockCall).toHaveBeenCalledTimes(1);
            expect(mockCall).toHaveBeenCalledWith(registeredReq, res);
        });

        it('Ends the result after a successful API call', () => {
            router.route(registeredReq, res);

            expect(ended).toBeTruthy();
        });
    });

    describe('Router with an unregistered API', () => {
        const unregisteredReq = {
            method: unregisteredMethod,
            url: `/${unregisteredEntity}/`
        };

        it('Writes error message to and closes the result when an unregistered API is called', () => {
            router.route(unregisteredReq, res);

            expect(written).toBeTruthy();
            expect(whatWasWritten).toEqual(JSON.stringify({'msg': 'error'}));
            expect(res.statusCode).toEqual(400);
            expect(ended).toBeTruthy();
        });
    });
});
