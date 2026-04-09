<template>
  <v-container>
    <h1>Create Point</h1>
    <v-form @submit.prevent="createPoint">
      <v-text-field v-model.number="deviceId" label="Device ID" type="number" required></v-text-field>
      <v-text-field v-model.number="plantId" label="Plant ID" type="number"></v-text-field>
      <v-text-field v-model.number="capacityId" label="Capacity ID" type="number"></v-text-field>
      <v-text-field v-model.number="index" label="Index" type="number" required></v-text-field>
      <v-text-field v-model="address" label="Address"></v-text-field>
      <v-text-field v-model="status" label="Status"></v-text-field>
      <v-text-field v-model.number="humidity" label="Humidity" type="number"></v-text-field>
      <v-text-field v-model="notes" label="Notes"></v-text-field>
      <v-text-field v-model.number="wateringType" label="Watering Type" type="number" required></v-text-field>
      <v-text-field v-model.number="wateringValue" label="Watering Value" type="number" required></v-text-field>
      <v-text-field v-model.number="wateringHour" label="Watering Hour" type="number" required></v-text-field>
      <v-btn type="submit" color="primary">Create</v-btn>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useDeviceStore } from '~/stores/deviceStore';
import { VContainer, VForm, VTextField, VBtn } from 'vuetify/components';

const deviceStore = useDeviceStore();
const router = useRouter();

const deviceId = ref<number>(1);
const plantId = ref<number | null>(null);
const capacityId = ref<number | null>(null);
const index = ref<number>(1);
const address = ref('');
const status = ref('');
const humidity = ref<number | null>(null);
const notes = ref('');
const wateringType = ref<number>(0);
const wateringValue = ref<number>(0);
const wateringHour = ref<number>(0);

const createPoint = async () => {
  await deviceStore.createPoint({
    deviceId: deviceId.value,
    plantId: plantId.value,
    capacityId: capacityId.value,
    index: index.value,
    address: address.value,
    status: status.value,
    humidity: humidity.value,
    notes: notes.value,
    wateringType: wateringType.value,
    wateringValue: wateringValue.value,
    wateringHour: wateringHour.value,
  });
  router.push('/points');
};
</script>
