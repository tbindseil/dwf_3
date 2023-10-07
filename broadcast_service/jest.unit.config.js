module.exports = {
    transform: { '^.+\\.ts?$': 'ts-jest' },
    testEnvironment: 'node',
    testRegex: '/test/.*\\.(test|spec)?\\.(ts|tsx)$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    coverageProvider: 'v8',
    collectCoverageFrom: ['src/**/*.ts'],
    coveragePathIgnorePatterns: [
        'node_modules',
        '<rootDir>/src/app.ts',
        '<rootDir>/src/index.ts',
        '<rootDir>/src/db/knex_file.ts',
        '<rootDir>/src/db/migrations/*',
        '<rootDir>/src/db/migrations_knex_file.ts',
        '<rootDir>/src/picture_accessor/jimp_adapter.ts',
        '<rootDir>/src/handlers/index.ts',
    ],
};
