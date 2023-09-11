module.exports = {
    transform: { '^.+\\.ts?$': 'ts-jest' },
    testEnvironment: 'node',
    testRegex: '/test/.*\\.(test|spec)?\\.(ts|tsx)$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    coverageProvider: 'v8',

    globalSetup: '<rootDir>/test/integ/setup/global-setup.ts',
    globalTeardown: '<rootDir>/test/integ/setup/global-teardown.ts',
    testTimeout: 20000,
};
