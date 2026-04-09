<template>
  <div>
    <h1>Home Page</h1>

    <div>
      <p>You are authenticated.</p>
      <v-btn @click="authStore.logout">Sign Out</v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore'

const authStore = useAuthStore()
authStore.ensureHydrated()
</script>
