module.exports = {
    transform: { '^.+\\.ts?$': 'ts-jest' },
    testEnvironment: 'node',
    testRegex: '/test/.*\\.(test|spec)?\\.(ts|tsx)$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    coverageProvider: 'v8',
    coveragePathIgnorePatterns: [
        'node_modules',
        '<rootDir>/src/db/knex_file.ts',
    ],
};
