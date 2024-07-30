<template>
  <div>
    <h1>Create Device</h1>
    <form @submit.prevent="createDevice">
      <div>
        <label for="name">Name:</label>
        <input type="text" v-model="name" id="name" required />
      </div>
      <div>
        <label for="notes">Notes:</label>
        <input type="text" v-model="notes" id="notes" />
      </div>
      <div>
        <label for="deviceKey">Device Key:</label>
        <input type="text" v-model="deviceKey" id="deviceKey" required />
      </div>
      <button type="submit">Create</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const name = ref('');
const notes = ref('');
const deviceKey = ref('');
const router = useRouter();

const createDevice = async () => {
  await $fetch('/api/devices/create', {
    method: 'POST',
    body: { name: name.value, notes: notes.value, deviceKey: deviceKey.value },
  });
  router.push('/devices');
};
</script>
