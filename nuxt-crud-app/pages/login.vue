<script setup lang="ts">
import {definePageMeta, useAuth} from "#imports";

const {signIn} = await useAuth();

definePageMeta({
  middleware: ["auth"]
})
</script>

<template>
  <div>
    <h1>Login</h1>
    <v-btn @click="signIn">
      Sign In
    </v-btn>
  </div>
</template>
