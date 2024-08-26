<template>
  <v-app>
    <v-main>
      <div>
        <header>
          <nav>
            <nuxt-link to="/"><v-icon icon="mdi-home" /> Home</nuxt-link>
            <nuxt-link to="/devices">Devices</nuxt-link>
            <nuxt-link to="/capacitors">Capacitors</nuxt-link>
            <nuxt-link to="/places">Places</nuxt-link>
            <nuxt-link to="/points">Points</nuxt-link>
          </nav>
        </header>
        <main>
          <div class="main">
            <NuxtPage />
          </div>
        </main>
      </div>
    </v-main>
  </v-app>
</template>

<script setup>
import { VApp, VMain } from 'vuetify/components';
</script>

<style scoped>
header {
  background-color: #333;
  padding: 1rem;
}

.main {
  padding: 1rem;
}

nav a {
  color: white;
  margin-right: 1rem;
  text-decoration: none;
}
</style>
