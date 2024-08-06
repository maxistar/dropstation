<template>
  <v-container>
    <h1>Create Device</h1>
    <v-form @submit.prevent="createDevice">
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
      <v-btn type="submit" color="primary">Create</v-btn>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useDeviceStore } from '~/stores/deviceStore';
import { VContainer, VForm, VTextField, VBtn } from 'vuetify/components';

const name = ref('');
const notes = ref('');
const deviceKey = ref('');
const router = useRouter();
const deviceStore = useDeviceStore();

const createDevice = async () => {
  await deviceStore.createDevice(name.value, notes.value, deviceKey.value);
  router.push('/devices');
};
</script>
