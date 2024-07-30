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
import { useFetch } from '@nuxt3/vue';

const devices = ref([]);
const router = useRouter();
const { data } = await useFetch('/api/devices');

onMounted(() => {
  devices.value = data.value;
});

const createDevice = () => {
  router.push('/devices/create');
};

const editDevice = (id: number) => {
  router.push(`/devices/edit/${id}`);
};

const deleteDevice = async (id: number) => {
  await $fetch(`/api/devices/delete?id=${id}`);
  devices.value = devices.value.filter((device) => device.id !== id);
};
</script>
