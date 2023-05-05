module.exports = {
    transform: {'^.+\\.ts?$': 'ts-jest'},
    testEnvironment: 'node',
    testRegex: '/test/.*\\.(test|spec)?\\.(ts|tsx)$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    coverageProvider: 'v8',

    globalSetup: '<rootDir>/tests/global-setup.ts',
    globalTeardown: '<rootDir>/tests/global-teardown.ts',
};

/*
 * from integ test blog guide
 */
// module.exports = {
//   clearMocks: true,
//   roots: ['<rootDir>'],
//   setupFilesAfterEnv: ['jest-extended'],
//   globals: {
//     'ts-jest': {
//       diagnostics: false,
//     },
//   },
// }

