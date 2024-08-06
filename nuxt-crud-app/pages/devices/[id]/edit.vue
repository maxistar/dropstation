<template>
  <v-container>
    <h1>Edit Device</h1>
    <v-form @submit.prevent="updateDevice">
      <v-text-field
          v-model="name"
          label="Name"
          required
      ></v-text-field>
      <v-text-field
          v-model="notes"
          label="Notes"
      ></v-text-field>
      <v-text-field
          v-model="deviceKey"
          label="Device Key"
          required
      ></v-text-field>
      <v-btn type="submit" color="primary">Update</v-btn>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useDeviceStore } from '~/stores/deviceStore';
import { VContainer, VForm, VTextField, VBtn } from 'vuetify/components';

const name = ref('');
const notes = ref('');
const deviceKey = ref('');
const router = useRouter();
const route = useRoute();
const id = route.params.id;
const deviceStore = useDeviceStore();

const fetchDevice = async () => {
  await deviceStore.fetchDevices();
  const device = deviceStore.devices.find(device => device.id === Number(id));
  if (device) {
    name.value = device.name;
    notes.value = device.notes;
    deviceKey.value = device.device_key;
  }
};

const updateDevice = async () => {
  await deviceStore.updateDevice(Number(id), name.value, notes.value, deviceKey.value);
  router.push('/devices');
};

onMounted(fetchDevice);
</script>
