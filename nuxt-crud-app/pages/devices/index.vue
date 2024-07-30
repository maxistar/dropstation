<template>
  <div>
    <h1>Devices</h1>
    <ul>
      <li v-for="device in devices" :key="device.id">
        {{ device.name }}
        <button @click="editDevice(device.id)">Edit</button>
        <button @click="deleteDevice(device.id)">Delete</button>
      </li>
    </ul>
    <button @click="createDevice">Create Device</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useFetch } from '#app';

  
const devices = ref([]);
const router = useRouter();

const fetchDevices = async () => {
  console.log("fetch devices");
  const { data } = await useFetch('/api/devices');
  devices.value = data.value;
};

// Fetch devices when the component is mounted
onMounted(fetchDevices);

const createDevice = () => {
  router.push('/devices/create');
};

const editDevice = (id: number) => {
  router.push(`/devices/${id}/edit`);
};

const deleteDevice = async (id: number) => {
  await $fetch(`/api/devices/delete?id=${id}`, {
    method: 'DELETE',
  });
  fetchDevices();  // Fetch the updated list after deleting a device
};
</script>
