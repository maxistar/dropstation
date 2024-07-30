<template>
  <div>
    <h1>Edit Device</h1>
    <form @submit.prevent="updateDevice">
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
      <button type="submit">Update</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const name = ref('');
const notes = ref('');
const deviceKey = ref('');
const router = useRouter();
const route = useRoute();
const id = route.params.id;

const fetchDevice = async () => {
  const device = await $fetch(`/api/devices/${id}`);
  name.value = device.name;
  notes.value = device.notes;
  deviceKey.value = device.device_key;
};

const updateDevice = async () => {
  await $fetch('/api/devices/update', {
    method: 'POST',
    body: { id, name: name.value, notes: notes.value, deviceKey: deviceKey.value },
  });
  router.push('/devices');
};

onMounted(fetchDevice);
</script>
