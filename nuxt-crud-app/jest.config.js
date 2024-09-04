export default {
    preset: 'ts-jest',
    testEnvironment: 'jest-environment-jsdom',
    moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'vue'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
        '^.+\\.js$': 'babel-jest',
        '.*\\.(vue)$': 'vue3-jest'
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',  // Maps @/ to the root directory
        '^~/(.*)$': '<rootDir>/$1',  // Maps ~/ to the root directory
        '^vue$': 'vue/dist/vue.common.js'
    },
    snapshotSerializers: ['jest-serializer-vue'],  // Ensure this matches the installed package
    testMatch: ['**/tests/unit/**/*.spec.(js|ts)|**/__tests__/*.(js|ts)'],
    transformIgnorePatterns: ['/node_modules/'],
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.test.json'
        }
    }
};
