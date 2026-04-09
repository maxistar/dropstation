import { defineVitestConfig } from  '@nuxt/test-utils/config'

export default defineVitestConfig({
    test: {
        environment: 'nuxt' // IF YOU HAVE OTHER TESTS - DON'T SET THAT HERE
    }
})
