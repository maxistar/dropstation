<template>
  <div class="login-page">
    <h1>Login</h1>

    <form class="login-form" @submit.prevent="submit">
      <label>
        Username
        <input v-model="username" type="text" autocomplete="username" />
      </label>

      <label>
        Password
        <input v-model="password" type="password" autocomplete="current-password" />
      </label>

      <button :disabled="submitting" type="submit">
        {{ submitting ? 'Signing in...' : 'Sign in' }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/authStore'

const authStore = useAuthStore()
authStore.ensureHydrated()

const username = ref('admin')
const password = ref('admin')
const submitting = ref(false)
const error = ref('')

async function submit(): Promise<void> {
  submitting.value = true
  error.value = ''

  const result = await authStore.login(username.value, password.value)
  submitting.value = false

  if (!result.ok) {
    error.value = result.error || 'Login failed.'
    return
  }

  await navigateTo('/')
}
</script>

<style scoped>
.login-page {
  max-width: 360px;
  margin: 80px auto;
  padding: 16px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.login-form label {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.login-form input {
  padding: 8px;
}

.login-form button {
  padding: 8px;
}

.error {
  color: #b91c1c;
}
</style>
