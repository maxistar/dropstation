<template>
  <div>
    <header>
      <nav>
        <nuxt-link to="/">Home</nuxt-link>
        <nuxt-link to="/devices">Devices</nuxt-link>
      </nav>
    </header>
    <main>
      <NuxtPage />
    </main>
  </div>
</template>

<style scoped>
header {
  background-color: #333;
  padding: 1rem;
}

nav a {
  color: white;
  margin-right: 1rem;
  text-decoration: none;
}
</style>
