<template>
  <div>
    <h1>Devices</h1>
    <DeviceItem
        v-for="device in deviceStore.devices"
        :key="device.id"
        :device="device"
        @edit="editDevice"
        @delete="deleteDevice"
    />
    <v-btn @click="createDevice" color="primary"><v-icon icon="mdi-pen-plus" /> Create Device</v-btn>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useDeviceStore } from '~/stores/deviceStore';
import DeviceItem from '~/components/DeviceItem.vue';

const router = useRouter();
const deviceStore = useDeviceStore();

useAsyncData('devices', async () => await deviceStore.fetchDevices());

// onMounted(async () => {
//  await useAsyncData('user', () => deviceStore.fetchDevices().then(() => true))
// });


const createDevice = () => {
  router.push('/devices/create');
};

const editDevice = (id: number) => {
  router.push(`/devices/${id}/edit`);
};

const deleteDevice = async (id: number) => {
  await deviceStore.deleteDevice(id);
};
</script>
