import { defineStore } from 'pinia'

interface LoginResult {
  ok: boolean
  error?: string
}

interface AuthStoreState {
  token: string | null
  tokenType: string
  hydrated: boolean
}

interface LoginResponse {
  token: string
  tokenType: string
  expiresIn: number
}

const TOKEN_KEY = 'watering-nuxt-auth-token'
const TOKEN_TYPE_KEY = 'watering-nuxt-auth-token-type'

export const useAuthStore = defineStore('authStore', {
  state: (): AuthStoreState => ({
    token: null,
    tokenType: 'Bearer',
    hydrated: false,
  }),
  getters: {
    loggedIn: (state) => state.token !== null,
    authHeader: (state) => (state.token ? `${state.tokenType} ${state.token}` : null),
  },
  actions: {
    ensureHydrated() {
      if (this.hydrated || !import.meta.client) {
        this.hydrated = true
        return
      }

      this.token = localStorage.getItem(TOKEN_KEY)
      this.tokenType = localStorage.getItem(TOKEN_TYPE_KEY) || 'Bearer'
      this.hydrated = true
    },

    async login(username: string, password: string): Promise<LoginResult> {
      const config = useRuntimeConfig()

      try {
        const response = await $fetch<LoginResponse>('/api/ui/v1/auth/login', {
          baseURL: config.public.backendTsBaseUrl || 'http://localhost:3001',
          method: 'POST',
          body: { username, password },
        })

        this.token = response.token
        this.tokenType = response.tokenType || 'Bearer'

        if (import.meta.client) {
          localStorage.setItem(TOKEN_KEY, this.token)
          localStorage.setItem(TOKEN_TYPE_KEY, this.tokenType)
        }

        return { ok: true }
      } catch {
        this.clearSession()
        return { ok: false, error: 'Invalid username or password.' }
      }
    },

    async logout() {
      const header = this.authHeader
      const config = useRuntimeConfig()

      this.clearSession()

      if (!header) {
        await navigateTo('/login')
        return
      }

      try {
        await $fetch('/api/ui/v1/auth/logout', {
          baseURL: config.public.backendTsBaseUrl || 'http://localhost:3001',
          method: 'POST',
          headers: {
            Authorization: header,
          },
        })
      } catch {
        // local session already cleared
      }

      await navigateTo('/login')
    },

    clearSession() {
      this.token = null
      this.tokenType = 'Bearer'

      if (import.meta.client) {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(TOKEN_TYPE_KEY)
      }
    },
  },
})
