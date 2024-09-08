<template>
  <div>
    <h1>Home Page</h1>

    <div v-if="user">
      Hello {{ user.data.first_name }}

      <v-btn @click="signOut">
        Sign Out
      </v-btn>
    </div>
  </div>
</template>


<script setup lang="ts">
import {definePageMeta, useAuth} from "#imports";

const { signOut, user } = await useAuth();

definePageMeta({
  middleware: ["auth"]
})

if (!user) {
  navigateTo('/login')
}

</script>
