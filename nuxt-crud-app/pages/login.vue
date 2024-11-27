<template>
  <div>
    <h1>Login</h1>
    <v-btn @click="authStore.login">
      Sign In
    </v-btn>
  </div>
</template>

<script setup lang="ts">

import { definePageMeta, useAuthStore } from "#imports";

const authStore = useAuthStore();

definePageMeta({
  middleware: ["auth"]
})
 
</script>
