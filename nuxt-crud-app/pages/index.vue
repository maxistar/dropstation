<template>
  <div>
    <h1>Home Page</h1>

    <div v-if="authStore.loggedIn">
      Hello "dfdfdfd"

      <v-btn @click="authStore.logout">
        Sign Out
      </v-btn>
    </div>
  </div>
</template>


<script setup lang="ts">

import {definePageMeta, useAuthStore} from "#imports";
import {addRouteMiddleware, defineNuxtPlugin, navigateTo, useCookie} from '#app'

// const { signOut, user } = await useAuth();

const authStore = useAuthStore()

definePageMeta({
    middleware: ["auth"]
})
console.log('!!!')

if (!authStore.loggedIn) {
    navigateTo('/login/')
} 

</script>
