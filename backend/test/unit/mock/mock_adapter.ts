const autoConvertMapToObject = (map: Map<string, jest.Mock<any, any>>) => {
    const obj: any = {};
    for (const item of [...map]) {
        const [key, value] = item;
        obj[key] = value;
    }
    return obj;
};

// utility and example
export function getSingleFunctionMock<T>(
    toMock: any
): [jest.Mock<any, any>, T] {
    if (Object.keys(toMock).length !== 1) {
        throw new Error(
            `getSingleFunctionMock must have toMock with only one key, Object.keys(toMock) is: ${Object.keys(
                toMock
            )}`
        );
    }
    const key = Object.keys(toMock)[0];

    const [funcs, mocked] = mockObject<T>(toMock);
    const singleFunction = funcs.get(key);
    if (!singleFunction) {
        throw new Error(
            'getSingleFunctionMock failure, singleFunction is unknown'
        );
    }

    return [singleFunction, mocked];
}

export function mockObject<T>(
    toMock: any
): [Map<string, jest.Mock<any, any>>, T] {
    const funcs = new Map<string, jest.Mock<any, any>>();

    Object.keys(toMock).forEach((k: string) => {
        const mockFunc = jest.fn();
        funcs.set(k, mockFunc);
    });
    const mocked = autoConvertMapToObject(funcs);

    return [funcs, mocked as T];
}
