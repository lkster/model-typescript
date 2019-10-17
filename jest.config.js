module.exports = {
    preset: 'ts-jest',    
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    testMatch: ['**/spec/**/*.spec.ts'],
    rootDir: '.',
    setupFiles: ['<rootDir>/spec/test.ts']
}
