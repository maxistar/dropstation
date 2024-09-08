// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  css: ['vuetify/styles', '@mdi/font/css/materialdesignicons.min.css'],
  build: {
    transpile: ['vuetify'],
  },
  modules: [
    '@pinia/nuxt',
    '@nuxt/test-utils/module',
    './modules/oauth'
  ],
  pinia: {
    storesDirs: ['./stores/**'],
  },

  ssr: false,

  oauth: {
    endpoints: {
      authorization: 'https://login.microsoftonline.com/894013db-8fed-492e-ace8-8ef59655cadc/oauth2/v2.0/authorize',
      token: 'https://login.microsoftonline.com/894013db-8fed-492e-ace8-8ef59655cadc/oauth2/v2.0/token',
      userInfo: 'https://login.microsoftonline.com/894013db-8fed-492e-ace8-8ef59655cadc/.default',
      logout: 'https://login.microsoftonline.com/894013db-8fed-492e-ace8-8ef59655cadc/oauth2/v2.0/logout'
    },
    clientId: '5b113074-b63c-4043-bb99-e9f99e9e824e',
    scope: ['5b113074-b63c-4043-bb99-e9f99e9e824e/.default'],

    redirect: {
      //home: '/home'
    },
  },
})
