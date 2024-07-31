<template>
  <div>
    <h1>Devices</h1>
    <DeviceItem
        v-for="device in devices"
        :key="device.id"
        :device="device"
        @edit="editDevice"
        @delete="deleteDevice"
    />
    <v-btn @click="createDevice" color="primary">Create Device</v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DeviceItem from '~/components/DeviceItem.vue';
import { VBtn } from 'vuetify/components';

const devices = ref([]);
const router = useRouter();

const fetchDevices = async () => {
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
  await useFetch(`/api/devices/delete?id=${id}`, {
    method: 'DELETE',
  });
  fetchDevices();  // Fetch the updated list after deleting a device
};
</script>
