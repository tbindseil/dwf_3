import API from '../src/handlers/api';
import APIError from '../src/handlers/api_error';
import * as stream_request from '../src/stream_request';
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

    const streamReadResult = {
        key: 'value'
    };
    const mockStreamRequest = jest.spyOn(stream_request, 'stream_request');
    mockStreamRequest.mockImplementation(async (req: any): Promise<any> => {
        req;
        return await streamReadResult;
    });

    let mockAPIInstance: API;
    let router: Router;

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
        it('Routes to an API after the API is registered', async () => {
            await router.route(registeredReq, res);

            const mockCall = mockAPIInstance.call as jest.Mock;
            expect(mockCall).toHaveBeenCalledTimes(1);
            expect(mockCall).toHaveBeenCalledWith(streamReadResult);
        });

        it('Ends the result after a successful API call', async () => {
            const output = 'output';
            const mockCall = mockAPIInstance.call as jest.Mock;
            mockCall.mockImplementation((body: any) => { body; return output; });

            await router.route(registeredReq, res);

            expect(whatWasWritten).toEqual(output);
            expect(ended).toBeTruthy();
        });

        it('Handles APIError', async () => {
            const apiErrorStatusCode = 123;
            const apiErrorMsg = 'apiErrorMsg';
            const mockCall = mockAPIInstance.call as jest.Mock;
            mockCall.mockImplementation((body: any) => { body; throw new APIError(apiErrorStatusCode, apiErrorMsg); });

            await router.route(registeredReq, res);

            expect(res.statusCode).toEqual(apiErrorStatusCode);
            expect(whatWasWritten).toEqual(apiErrorMsg);
            expect(ended).toBeTruthy();
        });

        it('Handles non APIError', async () => {
            const mockCall = mockAPIInstance.call as jest.Mock;
            mockCall.mockImplementation((body: any) => { body; throw {}; });

            await router.route(registeredReq, res);

            expect(res.statusCode).toEqual(Router.DEFAULT_ERROR_STATUS_CODE);
            expect(whatWasWritten).toEqual(Router.DEFAULT_ERROR_MSG);
            expect(ended).toBeTruthy();
        });
    });

    describe('Router with an unregistered API', () => {
        const unregisteredReq = {
            method: unregisteredMethod,
            url: `/${unregisteredEntity}/`
        };

        it('Writes error message to and closes the result when an unregistered API is called', async () => {
            await router.route(unregisteredReq, res);

            expect(written).toBeTruthy();
            expect(whatWasWritten).toEqual(JSON.stringify({'msg': 'error, invalid method or entity'}));
            expect(res.statusCode).toEqual(404);
            expect(ended).toBeTruthy();
        });
    });
});
