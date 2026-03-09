import { useAuthStore } from '~/stores/authStore'

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  authStore.ensureHydrated()

  const isLoginPage = to.path === '/login' || to.path === '/login/'

  if (authStore.loggedIn && isLoginPage) {
    return navigateTo('/')
  }

  if (!authStore.loggedIn && !isLoginPage) {
    return navigateTo('/login')
  }
})
